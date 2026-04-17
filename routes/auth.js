const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const multer = require("multer");
const { registerValidation, loginValidation } = require("../middleware/validation");
const { generateToken } = require("../middleware/jwtAuth");
const { sendWelcomeEmail } = require("../utils/emailService");
const path = require("path");

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

const router = express.Router();

// SHOW REGISTER
router.get("/register", (req, res) => {
  res.render("auth/register");
});

// SHOW LOGIN
router.get("/login", (req, res) => {
  res.render("auth/login");
});

// REGISTER
router.post("/register", upload.single("profilePicture"), registerValidation, async (req, res) => {
  try {
    const { name, email, password, profession } = req.body;
    const profilePicture = req.file ? req.file.filename : "";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: [{ msg: "Email already registered" }] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profession,
      profilePicture,
    });

    sendWelcomeEmail(email, name);

    return res.status(200).json({ success: true, redirectUrl: "/login" });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// LOGIN
router.post("/login", loginValidation, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user._id;
    
    return res.status(200).json({ success: true, redirectUrl: "/" });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: "Server error" });
  }
});

// API LOGIN (Returns JWT)
router.post("/api/login", loginValidation, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profession: user.profession,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// API REGISTER
router.post("/api/register", upload.single("profilePicture"), registerValidation, async (req, res) => {
  try {
    const { name, email, password, profession } = req.body;
    const profilePicture = req.file ? req.file.filename : "";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: [{ msg: "Email already registered" }] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profession,
      profilePicture,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profession: user.profession,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// GOOGLE AUTH
const passport = require("passport");

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Set session userId for compatibility with existing middleware
    req.session.userId = req.user._id;
    res.redirect("/");
  }
); 

module.exports = router;
