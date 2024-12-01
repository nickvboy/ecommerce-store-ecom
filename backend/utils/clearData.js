const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

// Import all models
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');

const clearData = async () => {
  try {
    await connectDB();
    
    // Clear all collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    
    console.log('All data cleared successfully while preserving table structures');
    
    if (require.main === module) {
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

module.exports = clearData;

if (require.main === module) {
  clearData();
} 