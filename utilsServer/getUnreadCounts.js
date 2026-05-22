const Chat = require("../models/Chat");
const Notification = require("../models/Notification");

const chatHasUnread = (chat, userId) => {
  if (!chat.messages?.length) return false;

  const hasUnreadFlag = chat.messages.some(
    (msg) =>
      msg.receiver.toString() === userId.toString() && msg.read === false
  );
  if (hasUnreadFlag) return true;

  const last = chat.messages[chat.messages.length - 1];
  return (
    last.receiver.toString() === userId.toString() && last.read !== true
  );
};

async function getUnreadMessageCount(userId) {
  const chatDoc = await Chat.findOne({ user: userId });
  if (!chatDoc?.chats?.length) return 0;

  return chatDoc.chats.filter((chat) => chatHasUnread(chat, userId)).length;
}

async function getUnreadNotificationCount(userId, user) {
  if (!user?.unreadNotification) return 0;

  const notifDoc = await Notification.findOne({ user: userId });
  if (!notifDoc?.notifications?.length) return user.unreadNotification ? 1 : 0;

  return notifDoc.notifications.length;
}

async function getUnreadCounts(userId, user) {
  const [unreadMessageCount, unreadNotificationCount] = await Promise.all([
    getUnreadMessageCount(userId),
    getUnreadNotificationCount(userId, user),
  ]);

  return { unreadMessageCount, unreadNotificationCount };
}

module.exports = {
  getUnreadCounts,
  getUnreadMessageCount,
  getUnreadNotificationCount,
  chatHasUnread,
};
