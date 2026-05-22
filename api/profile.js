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
const findUserByIdOrUsername = require("../utilsServer/findUserByIdOrUsername");

// GET POSTS OF USER
router.get("/posts/:userId", validateRequest, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await findUserByIdOrUsername(userId);

    if (!user) {
      return res.status(404).send("No user Found");
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
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

    const removeFollowing = user.following.findIndex(
      (following) => following.user.toString() === userToUnfollowId
    );

    if (removeFollowing === -1) {
      return res.status(401).send("User not followed before");
    }

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
    const { bio, website, profilePicUrl, coverPicUrl, name } = req.body;

    const profileUpdate = {};
    if (bio !== undefined) profileUpdate.bio = bio;
    if (website !== undefined) profileUpdate.website = website;

    await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileUpdate },
      { new: true, upsert: true }
    );

    const user = await User.findById(userId);
    if (profilePicUrl) user.profilePicUrl = profilePicUrl;
    if (coverPicUrl) user.coverPicUrl = coverPicUrl;
    if (name && name.trim().length >= 2) user.name = name.trim();
    await user.save();

    const profile = await Profile.findOne({ user: userId }).populate("user");

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
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

// GET PROFILE (must be last — /:profileId catches single-segment paths only)
router.get("/:profileId", validateRequest, async (req, res) => {
  try {
    const profileId = req.params.profileId;

    const user = await findUserByIdOrUsername(profileId);

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    let profile = await Profile.findOne({ user: user._id }).populate("user");

    if (!profile) {
      await Profile.create({ user: user._id, bio: "", website: "" });
      profile = await Profile.findOne({ user: user._id }).populate("user");
    }

    const profilePayload = profile.toObject ? profile.toObject() : { ...profile };
    if (!profilePayload.user) {
      profilePayload.user = user.toObject ? user.toObject() : user;
    }

    const profileFollowStats = await Follower.findOne({ user: user._id });

    return res.json({
      profile: profilePayload,
      followersLength: profileFollowStats?.followers?.length ?? 0,
      followingLength: profileFollowStats?.following?.length ?? 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
