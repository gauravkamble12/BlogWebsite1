const express = require("express");
const Like = require("../models/Like");
const auth = require("../middleware/auth");

const router = express.Router();
router.post("/like/:id/ajax", auth, async (req, res) => {
  const exists = await Like.findOne({
    user: req.session.userId,
    blog: req.params.id,
  });

  if (exists) {
    await Like.findByIdAndDelete(exists._id);
  } else {
    await Like.create({
      user: req.session.userId,
      blog: req.params.id,
    });
  }

  const count = await Like.countDocuments({ blog: req.params.id });
  res.json({ count });
});

// router.post("/like/:id", auth, async (req, res) => {
//   const exists = await Like.findOne({
//     user: req.session.userId,
//     blog: req.params.id,
//   });

//   if (!exists) {
//     await Like.create({
//       user: req.session.userId,
//       blog: req.params.id,
//     });
//   }

//   // ✅ redirect safely
//   res.redirect(req.get("referer") || "/");
// });


module.exports = router;
