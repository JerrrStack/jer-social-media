const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";

module.exports = {
  productionBrowserSourceMaps: false,
  env: {
    CLOUDINARY_CLOUD_NAME: cloudName,
    CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || "",
    CLOUDINARY_URL:
      process.env.CLOUDINARY_URL ||
      (cloudName
        ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        : ""),
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.parallelism = 1;
    }
    return config;
  },
};
