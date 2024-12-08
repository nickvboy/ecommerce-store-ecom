const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload endpoint
router.post('/', async (req, res) => {
  try {
    const { file } = req.body;
    
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: 'ecommerce'
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 