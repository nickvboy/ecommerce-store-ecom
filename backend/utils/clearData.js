const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
// Import any other models that need to be cleared

const clearData = async () => {
  try {
    await connectDB();
    
    // Clear all collections
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    // Add any other collections that need to be cleared
    
    console.log('All data cleared successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

module.exports = clearData;

if (require.main === module) {
  clearData();
} 