const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exportDatabase, importDatabase } = require('../../controllers/databaseController.js');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Order = require('../../models/Order');
const Review = require('../../models/Review');

// @route   POST api/database/clear
// @desc    Clear all collections in the database
// @access  Private
router.post('/clear', async (req, res) => {
    try {
        // Clear all collections without using session
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Category.deleteMany({}),
            Order.deleteMany({}),
            Review.deleteMany({})
        ]);

        res.json({
            success: true,
            message: 'Database cleared successfully'
        });
    } catch (error) {
        console.error('Clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear database',
            error: error.message
        });
    }
});

// @route   GET api/database/export
// @desc    Export entire database to JSON
// @access  Private
router.get('/export', async (req, res) => {
    try {
        const data = await exportDatabase();
        // Send the data directly to the client
        res.json(data);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export database',
            error: error.message
        });
    }
});

// @route   POST api/database/import
// @desc    Import database from JSON
// @access  Private
router.post('/import', importDatabase);

module.exports = router; 