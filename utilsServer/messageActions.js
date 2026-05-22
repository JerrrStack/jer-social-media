const Chat = require("../models/Chat");
const User = require("../models/User");
const { chatHasUnread } = require("./getUnreadCounts");

const markChatMessagesRead = async (userId, messagesWith) => {
  const chatDoc = await Chat.findOne({ user: userId });
  if (!chatDoc) return;

  const chat = chatDoc.chats.find(
    (c) => c.messagesWith.toString() === messagesWith
  );
  if (!chat) return;

  let changed = false;
  chat.messages.forEach((msg) => {
    if (msg.receiver.toString() === userId.toString() && msg.read !== true) {
      msg.read = true;
      changed = true;
    }
  });

  if (changed) {
    chatDoc.markModified("chats");
    await chatDoc.save();
  }

  const stillUnread = chatDoc.chats.some((c) => chatHasUnread(c, userId));
  const user = await User.findById(userId);
  if (user && user.unreadMessage !== stillUnread) {
    user.unreadMessage = stillUnread;
    await user.save();
  }
};

const loadMessages = async (userId, messagesWith) => {
  try {
    await markChatMessagesRead(userId, messagesWith);

    const user = await Chat.findOne({ user: userId }).populate(
      "chats.messagesWith"
    );

    const chat = user.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    );

    if (!chat) {
      return { error: "No chat found" };
    }

    return { chat };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const sendMsg = async (userId, msgSendToUserId, msg) => {
  try {
    // LOGGED IN USER (SENDER)
    const user = await Chat.findOne({ user: userId });

    // RECEIVER
    const msgSendToUser = await Chat.findOne({ user: msgSendToUserId });

    const newMsgForSender = {
      sender: userId,
      receiver: msgSendToUserId,
      msg,
      date: Date.now(),
      read: true,
    };

    const newMsgForReceiver = {
      sender: userId,
      receiver: msgSendToUserId,
      msg,
      date: Date.now(),
      read: false,
    };

    const previousChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    );

    if (previousChat) {
      previousChat.messages.push(newMsgForSender);
      await user.save();
    } else {
      const newChat = {
        messagesWith: msgSendToUserId,
        messages: [newMsgForSender],
      };
      user.chats.unshift(newChat);
      await user.save();
    }

    const previousChatForReceiver = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );

    if (previousChatForReceiver) {
      previousChatForReceiver.messages.push(newMsgForReceiver);
      await msgSendToUser.save();
    } else {
      const newChat = {
        messagesWith: userId,
        messages: [newMsgForReceiver],
      };
      msgSendToUser.chats.unshift(newChat);
      await msgSendToUser.save();
    }

    return { newMsg: newMsgForSender };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const setMsgToUnread = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user.unreadMessage) {
      user.unreadMessage = true;
      await user.save();
    }

    return;
  } catch (error) {
    console.error(error);
  }
};

const deleteMsg = async (userId, messagesWith, messageId) => {
  try {
    const user = await Chat.findOne({ user: userId });

    const chat = user.chats.find(
      (chat) => chat.messagesWith.toString() === messagesWith
    );

    if (!chat) return;

    const messageToDelete = chat.messages.find(
      (message) => message._id.toString() === messageId
    );

    if (!messageToDelete) return;

    if (messageToDelete.sender.toString() !== userId) {
      return;
    }

    const indexOf = chat.messages
      .map((message) => message._id.toString())
      .indexOf(messageToDelete._id.toString());

    await chat.messages.splice(indexOf, 1);

    await user.save();

    return { success: true };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadMessages,
  sendMsg,
  setMsgToUnread,
  deleteMsg,
  markChatMessagesRead,
};
