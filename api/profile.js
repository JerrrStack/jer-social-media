const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body } = require("express-validator");
const Post = require("../models/Post");
const Follower = require("../models/Follower");
const Profile = require("../models/Profile");
const validateRequest = require("../middleware/validateRequest");
const bcrypt = require("bcryptjs");
const {
  newFollowerNotification,
  removeFollowerNotification,
} = require("../utilsServer/notificationActions");

// GET PROFILE INFO OF A USER
router.get("/:username", validateRequest, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).send("No User Found");
    }

    const profile = await Profile.findOne({ user: user._id }).populate("user");

    const profileFollowStats = await Follower.findOne({ user: user._id });

    return res.json({
      profile,

      followersLength:
        profileFollowStats.followers.length > 0
          ? profileFollowStats.followers.length
          : 0,

      followingLength:
        profileFollowStats.following.length > 0
          ? profileFollowStats.following.length
          : 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// GET POSTS OF USER
router.get("/posts/:username", validateRequest, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).send("No user Found");
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createAt: -1 })
      .populate("user")
      .populate("comments.user");

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(401).send("Server Error");
  }
});

// GET FOLLOWERS
router.get("/followers/:userId", validateRequest, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Follower.findOne({ user: userId }).populate(
      "followers.user"
    );

    if (!user) {
      return res.status(404).send("No user found");
    }

    return res.json(user.followers);
  } catch (error) {
    console.error(error);
    return res.status(401).send("Server Error");
  }
});

// GET FOLLOWING
router.get("/following/:userId", validateRequest, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Follower.findOne({ user: userId }).populate(
      "following.user"
    );

    return res.json(user.following);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

//FOLLOW A USER
router.post("/follow/:userToFollowId", validateRequest, async (req, res) => {
  try {
    const { userId } = req;
    const { userToFollowId } = req.params;

    const user = await Follower.findOne({ user: userId });
    const userToFollow = await Follower.findOne({ user: userToFollowId });

    if (!user || !userToFollow) {
      return res.status(404).send("User not found");
    }

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter(
        (following) => following.user.toString() === userToFollowId
      ).length > 0;

    if (isFollowing) {
      return res.status(401).send("User Already Followed");
    }

    await user.following.unshift({ user: userToFollowId });
    await user.save();

    //ADD NOTIFICATION
    await newFollowerNotification(userId, userToFollowId);

    await userToFollow.followers.unshift({ user: userId });
    await userToFollow.save();

    return res.status(200).send("Followed");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// UNFOLLOW A USER
router.put("/unfollow/:userToUnfollowId", validateRequest, async (req, res) => {
  try {
    const { userId } = req;
    const { userToUnfollowId } = req.params;

    const user = await Follower.findOne({
      user: userId,
    });

    const userToUnfollow = await Follower.findOne({
      user: userToUnfollowId,
    });

    if (!user || !userToUnfollow) {
      return res.status(404).send("User not found");
    }

    const isFollowing =
      user.following.length >= 0 &&
      user.following.filter(
        (following) => following.user.toString() === userToUnfollowId
      ).length === 0;

    if (isFollowing) {
      return res.status(401).send("User Not Followed before");
    }

    const removeFollowing = await user.following
      .map((following) => following.user.toString())
      .indexOf(userToUnfollowId);

    await user.following.splice(removeFollowing, 1);
    await user.save();

    const removeFollower = await userToUnfollow.followers
      .map((follower) => follower.user.toString())
      .indexOf(userId);

    await userToUnfollow.followers.splice(removeFollower, 1);
    await userToUnfollow.save();

    //ADD NOTIFICATION
    await removeFollowerNotification(userId, userToUnfollowId);

    return res.status(200).send("Unfollowed");
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
});

// UPDATE PROFILE
router.post("/update", validateRequest, async (req, res) => {
  try {
    const { userId } = req;

    const { bio, website, profilePicUrl } = req.body;

    let profileInfo = {};

    profileInfo.bio = bio;

    if (website) profileInfo.website = website;

    await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileInfo },
      { new: true }
    );

    if (profilePicUrl) {
      const user = await User.findById(userId);
      user.profilePicUrl = profilePicUrl;
      await user.save();
    }
    return res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// UPDATE PASSWORD
router.post(
  "/settings/password",
  [
    body("newPassword")
      .trim()
      .isLength({ min: 6, max: 20 })
      .withMessage("New password must have 4 to 20 characters long"),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const { userId } = req;

      const user = await User.findById(userId).select("+password");

      const isPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isPassword) {
        return res.status(401).send("Invalid Password");
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).send("Updated successfully");
    } catch (error) {
      console.error(error);
      return res.status(401).send("Server Error");
    }
  }
);

module.exports = router;
