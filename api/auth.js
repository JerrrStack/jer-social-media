const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Follower = require("../models/Follower");
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
    let userFollowStats = await Follower.findOne({ user: req.userId });
    if (!userFollowStats) {
      userFollowStats = { followers: [], following: [] };
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
