const express = require("express");
const { sendSubscriptionEmail } = require("../utils/newsletterService");

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required" });
  }

  try {
    // In a real app, you'd save this to a Subscriber model
    await sendSubscriptionEmail(email);
    res.json({ status: "success", message: "Successfully subscribed to the newsletter!" });
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    res.status(500).json({ status: "error", message: "Subscription failed" });
  }
});

module.exports = router;
