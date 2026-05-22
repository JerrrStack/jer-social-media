const port = process.env.PORT || "3000";

const baseUrl =
  process.env.NODE_ENV !== "production"
    ? `http://localhost:${port}`
    : process.env.BASE_URL || "https://jer-social-media.onrender.com";
export default baseUrl;
