const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    profession: String,
    profilePicture: { type: String, default: "" },
    googleId: { type: String, unique: true, sparse: true },
    resetPasswordOTP: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
