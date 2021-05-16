const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");
const validateRequest = require("../middleware/validateRequest");

// GET ALL CHATS

router.get("/", validateRequest, async (req, res) => {
  try {
    const { userId } = req;

    const user = await Chat.findOne({ user: userId }).populate(
      "chats.messagesWith"
    );

    let chatsToBeSent = [];

    if (user.chats.length > 0) {
      chatsToBeSent = await user.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        name: chat.messagesWith.name,
        profilePicUrl: chat.messagesWith.profilePicUrl,
        lastMessage: chat.messages[chat.messages.length - 1].msg,
        date: chat.messages[chat.messages.length - 1].date,
      }));
    }

    return res.json(chatsToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// GET USER INFO

router.get("/user/:userToFindId", validateRequest, async (req, res) => {
  try {
    const user = await User.findById(req.params.userToFindId);

    if (!user) {
      return res.status(404).send("No User found");
    }

    return res.json({ name: user.name, profilePicUrl: user.profilePicUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// Delete a chat

router.delete(`/:messagesWith`, validateRequest, async (req, res) => {
  try {
    const { userId } = req;
    const { messagesWith } = req.params;

    const user = await Chat.findOne({ user: userId });

    const chatToDelete = user.chats.find(
      (chat) => chat.messagesWith.toString() === messagesWith
    );

    if (!chatToDelete) {
      return res.status(404).send("Chat not found");
    }

    const indexOf = user.chats
      .map((chat) => chat.messagesWith.toString())
      .indexOf(messagesWith);

    user.chats.splice(indexOf, 1);

    await user.save();

    return res.status(200).send("Chat deleted");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
