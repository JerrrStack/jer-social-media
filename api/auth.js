const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Follower = require("../models/Follower");
const Profile = require("../models/Profile");
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");
const validateRequest = require("../middleware/validateRequest");
const {
  isValidEmail,
  isValidPassword,
} = require("../utils/validation");

const { getUnreadCounts } = require("../utilsServer/getUnreadCounts");

const router = express.Router();

router.get("/", validateRequest, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let userFollowStats = await Follower.findOne({ user: req.userId });
    if (!userFollowStats) {
      const [followerDoc] = await Promise.all([
        new Follower({
          user: req.userId,
          followers: [],
          following: [],
        }).save(),
        Profile.findOne({ user: req.userId }).then(
          (doc) => doc || new Profile({ user: req.userId }).save()
        ),
        Notification.findOne({ user: req.userId }).then(
          (doc) =>
            doc ||
            new Notification({ user: req.userId, notifications: [] }).save()
        ),
        Chat.findOne({ user: req.userId }).then(
          (doc) => doc || new Chat({ user: req.userId, chats: [] }).save()
        ),
      ]);
      userFollowStats = followerDoc;
    }

    const { unreadMessageCount, unreadNotificationCount } =
      await getUnreadCounts(req.userId, user);

    const userPayload = {
      ...user.toObject(),
      unreadMessageCount,
      unreadNotificationCount,
    };

    return res.status(200).json({ user: userPayload, userFollowStats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const email = req.body?.user?.email?.trim().toLowerCase();
  const password = req.body?.user?.password;

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (!isValidPassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(200).json(token);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
