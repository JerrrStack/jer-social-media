const express = require("express");
const axios = require("axios");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", validateRequest, async (req, res) => {
  const q = (req.query.q || "happy").toString().trim().slice(0, 40);
  const apiKey = process.env.GIPHY_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      message:
        "Add a free GIPHY_API_KEY to config.env (https://developers.giphy.com/dashboard)",
    });
  }

  try {
    const { data } = await axios.get("https://api.giphy.com/v1/gifs/search", {
      params: {
        api_key: apiKey,
        q,
        limit: 16,
        rating: "pg-13",
        lang: "en",
      },
      timeout: 8000,
    });

    const results = (data.data || [])
      .map((item) => {
        const images = item.images || {};
        const gif =
          images.fixed_height ||
          images.downsized ||
          images.original ||
          images.fixed_width;
        const preview =
          images.fixed_height_small ||
          images.preview_gif ||
          images.fixed_width_small ||
          gif;
        if (!gif?.url) return null;
        return {
          id: item.id,
          title: item.title || "GIF",
          url: gif.url,
          preview: preview?.url || gif.url,
        };
      })
      .filter(Boolean);

    return res.status(200).json(results);
  } catch (error) {
    console.error("Giphy GIF error:", error.response?.data || error.message);
    return res.status(502).json({
      message: "Could not load GIFs. Check GIPHY_API_KEY.",
    });
  }
});

module.exports = router;
