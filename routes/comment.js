const express = require("express");
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { commentValidation } = require("../middleware/validation");

const router = express.Router();

/**
 * CREATE COMMENT (NORMAL FORM)
 */
router.post("/comment/:id", auth, commentValidation, async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  const comment = await Comment.create({
    text: req.body.text,
    user: req.session.userId,
    blog: req.params.id,
  });

  if (blog.author.toString() !== req.session.userId.toString()) {
    const notification = await Notification.create({
      user: blog.author,
      message: "Someone commented on your blog",
      link: `/blogs/${blog._id}`,
    });

    if (global.io) {
      global.io.to(`user_${blog.author}`).emit("notification", notification);
    }
  }

  res.redirect(req.get("referer") || "/");
});

/**
 * CREATE COMMENT (AJAX – NO RELOAD)
 */
router.post("/comment/:id/ajax", auth, commentValidation, async (req, res) => {
  if (!req.body.text || req.body.text.trim() === "") {
    return res.status(400).json({ error: "Empty comment" });
  }

  const blog = await Blog.findById(req.params.id);

  const comment = await Comment.create({
    text: req.body.text,
    user: req.session.userId,
    blog: req.params.id,
    parent: req.body.parent || null,
  });

  const populated = await comment.populate("user");

  if (blog.author.toString() !== req.session.userId.toString()) {
    const notification = await Notification.create({
      user: blog.author,
      message: "Someone commented on your blog",
      link: `/blogs/${blog._id}`,
    });

    if (global.io) {
      global.io.to(`user_${blog.author}`).emit("notification", notification);
    }
  }

  if (global.io) {
    global.io.to(`blog_${req.params.id}`).emit("new_comment", populated);
  }

  res.json(populated);
});

/**
 * DELETE OWN COMMENT
 */
router.post("/comment/:id/delete", auth, async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment || comment.user.toString() !== req.session.userId) {
    return res.redirect(req.get("referer") || "/");
  }

  await Comment.findByIdAndDelete(req.params.id);
  res.redirect(req.get("referer") || "/");
});

module.exports = router;
