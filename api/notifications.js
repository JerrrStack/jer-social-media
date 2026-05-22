const express = require("express");
const router = express.Router();
const validateRequest = require("../middleware/validateRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");

router.get("/", validateRequest, async (req, res) => {
  try {
    const { userId } = req;

    const user = await Notification.findOne({ user: userId })
      .populate("notifications.user")
      .populate("notifications.post");

    return res.json(user.notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

router.post("/", validateRequest, async (req, res) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);

    if (user.unreadNotification) {
      user.unreadNotification = false;
      await user.save();
    }
    return res.status(200).send("Updated");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
