const User = require("../models/User");
const Post = require("../models/Post");
const {
  newLikeNotification,
  removeLikeNotification,
} = require("./notificationActions");

async function likeOrUnlikePost(postId, userId, like) {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return { success: false, error: "Post not found" };
    }

    const author = await User.findById(post.user);
    const alreadyLiked = post.likes.some(
      (item) => item.user.toString() === userId
    );

    if (like) {
      if (alreadyLiked) {
        return { success: false, error: "Post already liked" };
      }
      post.likes.unshift({ user: userId });
      await post.save();
      if (post.user.toString() !== userId) {
        await newLikeNotification(userId, postId, post.user.toString());
      }
    } else {
      if (!alreadyLiked) {
        return { success: false, error: "Post not liked before" };
      }
      const index = post.likes.findIndex(
        (item) => item.user.toString() === userId
      );
      post.likes.splice(index, 1);
      await post.save();
      if (post.user.toString() !== userId) {
        await removeLikeNotification(userId, postId, post.user.toString());
      }
    }

    return {
      success: true,
      name: author?.name,
      profilePicUrl: author?.profilePicUrl,
      username: author?.username,
      postByUserId: post.user.toString(),
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Server error" };
  }
}

module.exports = { likeOrUnlikePost };
