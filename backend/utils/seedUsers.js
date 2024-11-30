const mongoose = require('mongoose');
require('dotenv').config();
const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const connectDB = require('../config/db');

const generateUsers = (count = 30) => {
  const users = [];
  
  // Always create one admin user
  users.push({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    avatar: faker.image.avatar(),
    addresses: [{
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: 'United States',
      isDefault: true
    }]
  });

  // Generate regular users
  for (let i = 0; i < count - 1; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    users.push({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: 'password123', // Simple password for all test users
      role: 'user',
      avatar: faker.image.avatar(),
      addresses: Array(faker.number.int({ min: 1, max: 3 })).fill(null).map((_, index) => ({
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: 'United States',
        isDefault: index === 0
      }))
    });
  }

  return users;
};

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Generate and insert new users
    const users = generateUsers();
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.name} (${user.email})`);
    }
    
    console.log('Users seeded successfully');
    
    if (require.main === module) {
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

module.exports = seedUsers;

if (require.main === module) {
  seedUsers();
} 