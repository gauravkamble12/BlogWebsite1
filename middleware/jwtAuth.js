const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "blogsecret", {
    expiresIn: "30d",
  });
};

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.session?.userId) {
      return next();
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "blogsecret");
    req.session.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "blogsecret");
      req.session.userId = decoded.id;
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { generateToken, authMiddleware, optionalAuth };
