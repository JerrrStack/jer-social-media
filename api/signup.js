const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Follower = require("../models/Follower");
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");
const bcrypt = require("bcryptjs");
const {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} = require("../utils/validation");

const router = express.Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    if (!isValidUsername(username)) {
      return res.status(400).json({ message: "Invalid username format" });
    }

    const existing = await User.findOne({
      username: username.toLowerCase(),
    });

    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    return res.status(200).json({ message: "Available" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { mail, name, username, pass } = req.body.registerUser || {};
  const email = mail?.trim().toLowerCase();
  const displayName = name?.trim();
  const normalizedUsername = username?.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (!displayName || displayName.length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters" });
  }

  if (!isValidUsername(normalizedUsername)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  if (!isValidPassword(pass)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await new User({
      name: displayName,
      username: normalizedUsername,
      email,
      password: hashedPassword,
    }).save();

    await Promise.all([
      new Profile({ user: user._id }).save(),
      new Follower({ user: user._id, followers: [], following: [] }).save(),
      new Notification({ user: user._id, notifications: [] }).save(),
      new Chat({ user: user._id, chats: [] }).save(),
    ]);

    const token = jwt.sign({ userId: user._id }, process.env.jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(201).json(token);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
