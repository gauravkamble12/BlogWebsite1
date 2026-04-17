const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Blog = require("../models/Blog");
const Follow = require("../models/Follow");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer config for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profiles/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// REDIRECT TO OWN PROFILE
router.get("/profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.redirect(`/profile/${req.session.userId}`);
});

// SHOW EDIT PROFILE
router.get("/profile/edit", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const user = await User.findById(req.session.userId);
  res.render("edit-profile", { user });
});

// UPDATE PROFILE
router.post("/profile/edit", upload.single("profilePicture"), async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  
  try {
    const { name, profession } = req.body;
    const updateData = { name, profession };

    if (req.file) {
      updateData.profilePicture = req.file.filename;
    }

    await User.findByIdAndUpdate(req.session.userId, updateData);
    res.redirect(`/profile/${req.session.userId}`);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).send("Error updating profile");
  }
});

router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).render("404");
    
    const blogs = await Blog.find({ author: user._id });
    const followers = await Follow.countDocuments({ following: user._id });

    res.render("profile", { profileUser: user, blogs, followers });
  } catch (err) {
    res.status(500).render("404");
  }
});

// CHANGE PASSWORD (LOGGED IN)
router.post("/profile/change-password", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).send("New passwords do not match");
    }

    const user = await User.findById(req.session.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).send("Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.redirect(`/profile/${user._id}?success=password_changed`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
