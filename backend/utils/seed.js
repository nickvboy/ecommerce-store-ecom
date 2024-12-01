const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const seedUsers = require('./seedUsers');
const seedProducts = require('./seedProducts');
const seedReviews = require('./seedReviews');
const seedImages = require('./seedImages');
const seedOrders = require('./seedOrders');

async function seed() {
    try {
        // Seed users first
        await seedUsers();
        console.log('User seeding completed');

        // Then seed products and related data
        await seedProducts();
        await seedReviews();
        await seedImages();
        
        // Finally seed orders
        await seedOrders();
        console.log('Order seeding completed');
        
        console.log('All seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    seed();
}

module.exports = seed; 