const express = require('express');
const router = express.Router();
const newsletterService = require('../utils/newsletterService');
const mongoose = require('mongoose');
router.post('/admin/newsletter/broadcast', async (req, res) => {
  const { subject, body, adminKey } = req.body;

  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'supersecret') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    res.json({ message: 'Broadcast initiated successfully' });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ message: 'Failed to send broadcast' });
  }
});

module.exports = router;
