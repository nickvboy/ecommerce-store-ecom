const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');

// Get all products for search
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .select('name price images _id')
      .limit(100); // Adjust limit as needed
    
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Other routes...
router.get('/:id', async (req, res) => {
  // ... your existing route
});

module.exports = router; 