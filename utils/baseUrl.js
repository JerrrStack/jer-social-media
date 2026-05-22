const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : process.env.BASE_URL || "https://jer-social-media.onrender.com";

export default baseUrl;
