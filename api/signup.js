const express = require("express");
const isEmail = require("validator/lib/isEmail");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Follower = require("../models/Follower");
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");
const bcrypt = require("bcryptjs");
const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
const router = express.Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    if (username.length < 1) return res.status(401).send("Invalid");
    if (!regexUserName.test(username)) return res.status(401).send("Invalid");

    const user = await User.findOne({ username: username.toLowerCase() });

    if (user) return res.status(401).send("Username already taken");

    return res.status(200).send("Available");
  } catch (error) {
    console.error(error);
    return res.status(401).send("Server error");
  }
});

router.post("/", async (req, res) => {
  const { mail, name, username, pass } = req.body.registerUser;

  if (!isEmail(mail)) return res.status(401).send("Invalid Email");

  if (pass.length < 6) {
    return res.status(401).send("Password must be atleast 6 characters");
  }

  try {
    const existingUser = await User.findOne({ mail });

    if (existingUser) {
      return res.status(401).send("User already registered");
    }

    const user = new User({
      name,
      username: username.toLowerCase(),
      email: mail.toLowerCase(),
      password: pass,
    });

    user.password = await bcrypt.hash(pass, 10);

    await user.save();
    await new Profile({ user: user._id }).save();
    await new Follower({
      user: user._id,
      followers: [],
      following: [],
    }).save();
    await new Notification({ user: user._id, notifications: [] }).save();
    await new Chat({ user: user._id, chats: [] }).save();

    const payload = { userId: user._id };

    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json(token);
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
