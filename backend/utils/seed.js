const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const seedProducts = require('./seedProducts');
const seedReviews = require('./seedReviews');
const seedImages = require('./seedImages');

async function seed() {
    try {
        // Seed everything in sequence
        await seedProducts();
        await seedReviews();
        await seedImages();
        
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