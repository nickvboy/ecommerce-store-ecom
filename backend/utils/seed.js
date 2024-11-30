const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const seedUsers = require('./seedUsers');
const seedProducts = require('./seedProducts');
const seedReviews = require('./seedReviews');
const seedImages = require('./seedImages');
const seedOrders = require('./seedOrders');

async function seed() {
    try {
        // Step 1: Seed users
        console.log('Starting user seeding...');
        await seedUsers();
        console.log('✓ User seeding completed');

        // Step 2: Seed products and related data
        console.log('\nStarting product seeding...');
        await seedProducts();
        console.log('✓ Product seeding completed');
        
        console.log('\nStarting review seeding...');
        await seedReviews();
        console.log('✓ Review seeding completed');
        
        console.log('\nStarting image seeding...');
        await seedImages();
        console.log('✓ Image seeding completed');
        
        // Step 3: Finally seed orders (requires users and products)
        console.log('\nStarting order seeding...');
        await seedOrders();
        console.log('✓ Order seeding completed');
        
        console.log('\n✓ All seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Error during seeding:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    seed();
}

module.exports = seed; 