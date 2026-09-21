const express = require("express");
const Post = require("../models/Post");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

function formatLabel(tag) {
  return String(tag)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
}

/**
 * GET /api/trending
 * Returns ALL hashtags ranked by post count (never truncated).
 * Query: none required.
 */
router.get("/", validateRequest, async (req, res) => {
  try {
    // Newest posts first; no artificial topic cap
    const posts = await Post.find({})
      .select("text")
      .sort({ createdAt: -1 })
      .lean();

    const counts = {};
    const displayCase = {};

    for (const post of posts) {
      const text = String(post.text || "");
      const seen = new Set();
      const tagRegex = /#([A-Za-z][A-Za-z0-9_]{0,49})/g;
      let match;
      while ((match = tagRegex.exec(text)) !== null) {
        const original = match[1];
        const key = original.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        counts[key] = (counts[key] || 0) + 1;
        if (!displayCase[key]) displayCase[key] = original;
      }
    }

    const topics = Object.keys(counts)
      .map((key) => ({
        tag: displayCase[key],
        label: formatLabel(displayCase[key]),
        count: counts[key],
      }))
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.tag.toLowerCase().localeCompare(b.tag.toLowerCase())
      )
      .map((topic, index) => ({
        ...topic,
        rank: index + 1,
      }));

    res.set("Cache-Control", "no-store");
    return res.status(200).json({
      total: topics.length,
      topics,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
