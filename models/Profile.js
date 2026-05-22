const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    bio: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
