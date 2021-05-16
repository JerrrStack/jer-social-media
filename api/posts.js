const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Follower = require("../models/Follower");
const validateRequest = require("../middleware/validateRequest");
const uuid = require("uuid").v4;
const {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
} = require("../utilsServer/notificationActions");

//Create Post
router.post("/", validateRequest, async (req, res) => {
  const { text, location, picUrl } = req.body;
  const { userId } = req;

  if (text.length < 1)
    return res.status(401).send("Text must be atleast 1 character");

  try {
    const createPost = { user: userId, text };

    if (location) createPost.location = location;
    if (picUrl) createPost.picUrl = picUrl;

    const post = await new Post(createPost).save();

    const postCreated = await Post.findById(post._id).populate("user");
    return res.json(postCreated);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

//GET ALL POST
router.get("/", validateRequest, async (req, res) => {
  const { pageNumber } = req.query;

  const number = Number(pageNumber);

  const size = 8;

  try {
    let posts;

    if (number === 1) {
      posts = await Post.find()
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    } else {
      const skips = size * (number - 1);
      posts = await Post.find()
        .skip(skips)
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    }
    if (posts.length === 0) {
      return res.json([]);
    }

    let postsToBeSent = [];

    const { userId } = req;

    const loggedUser = await Follower.findOne({ user: userId });

    if (loggedUser.following.length === 0) {
      postsToBeSent = posts.filter(
        (post) => post.user._id.toString() === userId
      );
    } else {
      for (let i = 0; i < loggedUser.following.length; i++) {
        const foundPostsFromFollowing = posts.filter(
          (post) =>
            post.user._id.toString() === loggedUser.following[i].user.toString()
        );

        if (foundPostsFromFollowing.length > 0) {
          postsToBeSent.push(...foundPostsFromFollowing);
        }
      }
      const foundOwnPosts = posts.filter(
        (post) => post.user._id.toString() === userId
      );
      if (foundOwnPosts.length > 0) postsToBeSent.push(...foundOwnPosts);
    }
    postsToBeSent.length > 0 &&
      postsToBeSent.sort((a, b) => [
        new Date(b.createdAt) - new Date(a.createdAt),
      ]);
    return res.json(postsToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

// GET POST BY ID

router.get("/:postId", validateRequest, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("user")
      .populate("comments.user");

    if (!post) {
      return res.status(404).send("Post not Found");
    }

    return res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

// DELETE POST

router.delete("/:postId", validateRequest, async (req, res) => {
  try {
    const { userId } = req;

    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not Found");
    }

    const user = await User.findById(userId);

    if (post.user.toString() !== userId) {
      if (user.role === "root") {
        await post.remove();
        return res.status(200).send("Post deleted Successfully");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }
    await post.remove();
    return res.status(200).send("Post deleted Successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

//LIKE POST
router.post("/like/:postId", validateRequest, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0;

    if (isLiked) {
      return res.status(401).send("Post already liked");
    }

    await post.likes.unshift({ user: userId });
    await post.save();

    //ADD NOTIFICATION
    if (post.user.toString() !== userId) {
      await newLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post liked");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

//UNLIKE POST
router.put("/unlike/:postId", validateRequest, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length === 0;

    if (isLiked) {
      return res.status(401).send("Post not liked before");
    }

    const index = post.likes.map((like) =>
      like.user.toString().indexOf(userId)
    );

    await post.likes.splice(index, 1);
    await post.save();

    //ADD NOTIF
    if (post.user.toString() !== userId) {
      await removeLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post unliked");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

//GET ALL LIKES
router.get("/like/:postId", validateRequest, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("likes.user");

    if (!post) {
      return res.status(404).send("No post found");
    }

    return res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

//COMMENT
router.post("/comment/:postId", validateRequest, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const { text } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (text.length < 1) {
      return res.status(401).send("Text must be atleast 1 character");
    }

    const comment = {
      _id: uuid(),
      text,
      user: req.userId,
      date: Date.now(),
    };

    await post.comments.unshift(comment);
    await post.save();

    //ADD Notif
    if (post.user.toString() !== userId) {
      await newCommentNotification(
        postId,
        comment._id,
        userId,
        post.user.toString(),
        text
      );
    }

    return res.status(200).json(comment._id);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

//DELETE COMMENT
router.delete("/:postId/:commentId", validateRequest, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }
    const comment = post.comments.find((comment) => comment._id === commentId);
    if (!comment) {
      return res.status(404).send("No Comment found");
    }

    const user = await User.findById(userId);

    //DELETE COMMENT FUNCTION

    const deleteComment = async () => {
      const indexOf = post.comments
        .map((comment) => comment._id)
        .indexOf(commentId);

      await post.comments.splice(indexOf, 1);

      await post.save();

      //ADD NOTIFICATION
      if (post.user.toString() !== userId) {
        await removeCommentNotification(
          postId,
          comment._id,
          userId,
          post.user.toString()
        );
      }

      return res.status(200).send("Deleted Successfully");
    };

    if (comment.user.toString() !== userId) {
      if (user.role === "root") {
        await deleteComment();
      } else {
        return res.status(401).send("Unauthorized");
      }
    }

    await deleteComment();
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
