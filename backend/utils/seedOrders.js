const mongoose = require('mongoose');
require('dotenv').config();
const { faker } = require('@faker-js/faker');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const generateOrders = async (count = 50) => {
  // Get all users and products for reference
  const users = await User.find({ role: 'user' });
  const products = await Product.find({});
  const orders = [];

  for (let i = 0; i < count; i++) {
    // Generate between 1 and 5 items per order
    const numItems = faker.number.int({ min: 1, max: 5 });
    const items = [];
    let totalAmount = 0;

    // Generate items for this order
    for (let j = 0; j < numItems; j++) {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const price = product.price;
      
      // Only add variant if product has variants and they have values
      let variant = undefined;
      if (product.variants && 
          product.variants.length > 0 && 
          product.variants[0].values && 
          product.variants[0].values.length > 0) {
        variant = {
          name: product.variants[0].name,
          value: product.variants[0].values[0],
          priceModifier: 0
        };
      }
      
      items.push({
        product: product._id,
        quantity,
        price,
        variant,
        productName: product.name
      });

      totalAmount += price * quantity;
    }

    // Select a random user and one of their addresses
    const user = faker.helpers.arrayElement(users);
    const address = faker.helpers.arrayElement(user.addresses);

    // Generate order date within the last 6 months
    const orderDate = faker.date.past({ days: 180 });

    // Determine order status based on date
    const daysSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
    let status;
    if (daysSinceOrder < 1) status = 'pending';
    else if (daysSinceOrder < 3) status = 'processing';
    else if (daysSinceOrder < 7) status = 'shipped';
    else status = 'delivered';

    // Generate order
    orders.push({
      user: user._id,
      userName: user.name,
      items,
      status,
      shippingAddress: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country
      },
      totalAmount,
      paymentStatus: status === 'delivered' ? 'completed' : 'pending',
      orderDate
    });
  }

  return orders;
};

const seedOrders = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for order seeding');
    
    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders\n');
    
    // Generate and insert new orders
    const orders = await generateOrders();
    
    // Insert orders one by one with detailed logging
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const newOrder = new Order({
        user: order.user,
        items: order.items.map(({ product, quantity, price, variant }) => ({
          product,
          quantity,
          price,
          variant
        })),
        status: order.status,
        shippingAddress: order.shippingAddress,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate
      });
      
      await newOrder.save();
      
      // Log detailed order information
      console.log(`Order #${i + 1}`);
      console.log(`Customer: ${order.userName}`);
      console.log(`Status: ${order.status}`);
      console.log(`Items:`);
      order.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.productName} (Qty: ${item.quantity}, Price: $${item.price})`);
      });
      console.log(`Total Amount: $${order.totalAmount}`);
      console.log(`Shipping to: ${order.shippingAddress.city}, ${order.shippingAddress.state}`);
      console.log(`Order Date: ${order.orderDate.toLocaleDateString()}\n`);
    }
    
    console.log('All orders seeded successfully');
    
    if (require.main === module) {
      await mongoose.connection.close();
      console.log('Database connection closed');
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
