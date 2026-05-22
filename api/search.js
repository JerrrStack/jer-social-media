const express = require("express");
const router = express.Router();
const User = require("../models/User");
const validateRequest = require("../middleware/validateRequest");

router.get("/:searchText", validateRequest, async (req, res) => {
  try {
    const { searchText } = req.params;
    const { userId } = req;

    if (!searchText || searchText.trim().length === 0) {
      return res.status(200).json([]);
    }

    const namePattern = new RegExp(`^${searchText.trim()}`, "i");

    const results = await User.find({
      name: { $regex: namePattern },
    }).limit(20);

    const resultFilter = results.filter(
      (result) => result._id.toString() !== userId
    );

    return res.status(200).json(resultFilter);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
