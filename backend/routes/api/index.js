const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const reviewRoutes = require('./reviews');
const orderRoutes = require('./orders');

// Mount routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);

module.exports = router; 