const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const connectDB = require('../config/db');

const generateProductImages = (productId, count = 6) => {
  return Array(count).fill(null).map((_, index) => ({
    url: `https://picsum.photos/seed/${productId}-${index}/800/800`,
    order: index
  }));
};

const seedImages = async () => {
  try {
    await connectDB();
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update with images`);
    
    // Update each product with new images
    for (const product of products) {
      const images = generateProductImages(product._id.toString());
      product.images = images;
      await product.save();
      console.log(`Updated images for product: ${product.name}`);
    }
    
    mongoose.connection.close();
    console.log('Images seeded successfully');
  } catch (error) {
    console.error('Error seeding images:', error);
    process.exit(1);
  }
};

module.exports = seedImages;

if (require.main === module) {
  seedImages();
} 