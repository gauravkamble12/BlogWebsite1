const express = require("express");
const Follow = require("../models/Follow");
const Notification = require("../models/Notification");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /follow/:id
 * @desc    Follow an author (AJAX)
 */
router.post("/follow/:id", auth, async (req, res) => {
  try {
    const followerId = req.session.userId;
    const authorId = req.params.id;

    if (followerId === authorId) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    const exists = await Follow.findOne({
      follower: followerId,
      following: authorId,
    });

    if (!exists) {
      await Follow.create({
        follower: followerId,
        following: authorId,
      });

      // Notify the author
      const follower = await User.findById(followerId);
      const notification = await Notification.create({
        user: authorId,
        message: `${follower.name} is now following you!`,
        link: `/profile/${followerId}`,
      });

      if (global.io) {
        global.io.to(`user_${authorId}`).emit("notification", notification);
      }
    }

    res.json({ success: true, message: "Following" });
  } catch (err) {
    res.status(500).json({ error: "Follow failed" });
  }
});

/**
 * @route   POST /unfollow/:id
 * @desc    Unfollow an author (AJAX)
 */
router.post("/unfollow/:id", auth, async (req, res) => {
  try {
    await Follow.findOneAndDelete({
      follower: req.session.userId,
      following: req.params.id,
    });

    res.json({ success: true, message: "Unfollowed" });
  } catch (err) {
    res.status(500).json({ error: "Unfollow failed" });
  }
});

module.exports = router;
