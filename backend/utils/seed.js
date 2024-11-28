require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { seedDB } = require('./seedData');
const { seedImages } = require('./seedImages');

async function seed() {
    try {
        // First seed the products and reviews
        await seedDB();
        
        // Then seed the images
        await seedImages();
        
        console.log('All seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

seed(); 