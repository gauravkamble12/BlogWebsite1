const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const auth = require('../middleware/auth');

const upload = multer({ storage });

/**
 * @route   POST /api/upload-image
 * @desc    Upload single image to Cloudinary for Quill Editor
 * @access  Private
 */
router.post('/upload-image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the Cloudinary URL
    res.json({ url: req.file.path });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;
