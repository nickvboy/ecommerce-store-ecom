const mongoose = require('mongoose');
require('dotenv').config();
const { faker } = require('@faker-js/faker');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const generateOrders = async (count = 50) => {
  try {
    // Get all users and products for reference
    const users = await User.find({ role: 'user' });
    if (!users.length) {
      throw new Error('No users found in database');
    }

    const products = await Product.find({});
    if (!products.length) {
      throw new Error('No products found in database');
    }

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
        
        // Only add variant if product has variants
        let variant = undefined;
        if (product.variants && product.variants.length > 0) {
          const variantType = product.variants[0];
          if (variantType.options && variantType.options.length > 0) {
            const selectedOption = faker.helpers.arrayElement(variantType.options);
            variant = {
              name: variantType.name,
              value: selectedOption.value,
              priceModifier: selectedOption.priceModifier || 0
            };
          }
        }
        
        items.push({
          product: product._id,
          quantity,
          price,
          variant
        });

        totalAmount += price * quantity + (variant?.priceModifier || 0) * quantity;
      }

      // Select a random user and one of their addresses
      const user = faker.helpers.arrayElement(users);
      const address = user.addresses && user.addresses.length > 0 
        ? faker.helpers.arrayElement(user.addresses)
        : {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: 'United States'
          };

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
  } catch (error) {
    console.error('Error generating orders:', error);
    throw error;
  }
};

const seedOrders = async () => {
  let connection;
  try {
    // Ensure we have a connection
    connection = await connectDB();
    console.log('MongoDB Connected for order seeding');
    
    // Verify Order model is properly initialized
    if (!mongoose.models.Order) {
      throw new Error('Order model not properly initialized');
    }
    
    // Clear existing orders
    const deleteResult = await mongoose.models.Order.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing orders\n`);
    
    // Generate and insert new orders
    const orders = await generateOrders();
    console.log(`Generated ${orders.length} orders`);
    
    // Insert orders in batches
    const batchSize = 10;
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      await mongoose.models.Order.insertMany(batch);
      console.log(`Inserted orders ${i + 1} to ${Math.min(i + batchSize, orders.length)}`);
    }

    console.log('\nAll orders seeded successfully');
    
  } catch (error) {
    console.error('Error seeding orders:', error);
    throw error;
  } finally {
    if (connection && require.main === module) {
      await mongoose.disconnect();
      console.log('Database connection closed');
    }
  }
};

module.exports = seedOrders;

if (require.main === module) {
  seedOrders()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}