import axios from "axios";

const uploadPic = async (media) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  const uploadUrl =
    process.env.CLOUDINARY_URL ||
    (cloudName
      ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      : null);

  if (!uploadUrl || !cloudName || !uploadPreset) {
    console.error(
      "Cloudinary env missing: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, and CLOUDINARY_URL on Render"
    );
    return;
  }

  try {
    const form = new FormData();
    form.append("file", media);
    form.append("upload_preset", uploadPreset);
    form.append("cloud_name", cloudName);

    const res = await axios.post(uploadUrl, form);
    return res.data.url;
  } catch (err) {
    console.error("Cloudinary upload failed", err?.response?.data || err.message);
    return;
  }
};

export default uploadPic;
