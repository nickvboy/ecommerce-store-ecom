const mongoose = require('mongoose');
require('dotenv').config();
const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const connectDB = require('../config/db');

const generateOrders = async () => {
  try {
    // Get all users and products
    const users = await User.find({});
    const products = await Product.find({});
    
    const orders = [];
    
    // Generate 1-5 orders for each user
    for (const user of users) {
      const numOrders = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numOrders; i++) {
        // Generate 1-5 items per order
        const numItems = Math.floor(Math.random() * 5) + 1;
        const items = [];
        let totalAmount = 0;
        
        // Randomly select products and quantities
        const selectedProducts = faker.helpers.arrayElements(products, numItems);
        
        for (const product of selectedProducts) {
          // Only add item if product has stock
          if (product.stock > 0) {
            const quantity = Math.min(
              Math.floor(Math.random() * 5) + 1,
              product.stock
            );
            
            items.push({
              product: product._id,
              quantity,
              price: product.price
            });
            
            totalAmount += product.price * quantity;
            
            // Update product stock
            product.stock -= quantity;
            await product.save();
          }
        }
        
        if (items.length > 0) {
          // Use one of the user's addresses
          const address = user.addresses[Math.floor(Math.random() * user.addresses.length)];
          
          orders.push({
            user: user._id,
            items,
            totalAmount,
            status: faker.helpers.arrayElement(['pending', 'completed', 'cancelled']),
            shippingAddress: address
          });
        }
      }
    }
    
    return orders;
  } catch (error) {
    console.error('Error generating orders:', error);
    throw error;
  }
};

const seedOrders = async () => {
  try {
    await connectDB();
    
    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');
    
    // Generate and insert new orders
    const orders = await generateOrders();
    for (const orderData of orders) {
      const order = new Order(orderData);
      await order.save();
      console.log(`Created order for user: ${orderData.user}`);
    }
    
    console.log('Orders seeded successfully');
    
    if (require.main === module) {
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
};

module.exports = seedOrders;

if (require.main === module) {
  seedOrders();
} 