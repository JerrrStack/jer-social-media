const express = require("express");
const router = express.Router();
const User = require("../models/User");
const validateRequest = require("../middleware/validateRequest");

router.get("/:searchText", validateRequest, async (req, res) => {
  try {
    const { searchText } = req.params;
    const { userId } = req;

    if (searchText.length === 0) return;

    let namePattern = new RegExp(`^${searchText}`);

    const results = await User.find({
      name: { $regex: namePattern, $options: "i" },
    });

    const resultFilter =
      results.length > 0 &&
      results.filter((result) => result._id.toString() !== userId);

    return res.status(200).json(resultFilter);
  } catch (error) {
    console.error(error);
    return res.status(401).send("Server Error");
  }
});

module.exports = router;
