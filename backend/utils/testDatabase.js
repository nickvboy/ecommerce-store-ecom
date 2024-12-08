const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Review = require('../models/Review');

async function getCollectionCounts() {
    return {
        users: await User.countDocuments(),
        products: await Product.countDocuments(),
        categories: await Category.countDocuments(),
        orders: await Order.countDocuments(),
        reviews: await Review.countDocuments()
    };
}

async function waitForServer(retries = 30) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get('http://localhost:5001/api/health');
            if (response.data.status === 'ok') {
                console.log('\nServer is ready!');
                return true;
            }
        } catch (error) {
            process.stdout.write('.');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    throw new Error('Server failed to start after 30 seconds');
}

async function startServer() {
    return new Promise((resolve, reject) => {
        console.log('Starting server...');
        const serverPath = path.join(__dirname, '..', 'server.js');
        console.log('Server path:', serverPath);
        
        const server = spawn('node', [serverPath], {
            stdio: 'inherit',
            shell: true,
            env: { ...process.env, PORT: '5001' }
        });

        server.on('error', (err) => {
            console.error('Failed to start server:', err);
            reject(err);
        });

        // Give the server a moment to start
        setTimeout(() => resolve(server), 2000);
    });
}

async function testDatabaseOperations() {
    let serverProcess = null;
    try {
        console.log('Starting database test process...');

        // Start the server
        serverProcess = await startServer();
        console.log('Server process started, waiting for health check...');
        await waitForServer();

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Step 1: Run seed script
        console.log('\nStep 1: Running seed script...');
        try {
            const seedScript = require('./seed');
            await seedScript();
            console.log('Seed script completed successfully');
        } catch (error) {
            console.error('Error running seed script:', error);
            throw error;
        }
        
        // Get counts after seeding
        console.log('\nCounting documents after seeding:');
        const countAfterSeed = await getCollectionCounts();
        console.log(countAfterSeed);

        // Step 2: Export database
        console.log('\nStep 2: Exporting database...');
        try {
            const exportResponse = await axios.get('http://localhost:5001/api/database/export');
            const exportedFile = exportResponse.data.filename;
            console.log('Database exported to:', exportedFile);

            // Step 3: Clear database
            console.log('\nStep 3: Clearing database...');
            await axios.post('http://localhost:5001/api/database/clear');
            
            // Verify database is empty
            console.log('\nVerifying database is empty:');
            const countAfterClear = await getCollectionCounts();
            console.log(countAfterClear);

            // Step 4: Import database
            console.log('\nStep 4: Importing database...');
            const fileData = fs.readFileSync(exportedFile, 'utf8');
            const jsonData = JSON.parse(fileData);
            await axios.post('http://localhost:5001/api/database/import', {
                data: jsonData.data
            });

            // Step 5: Verify counts match
            console.log('\nStep 5: Verifying document counts after import:');
            const countAfterImport = await getCollectionCounts();
            console.log(countAfterImport);

            // Compare counts
            const countsMatch = JSON.stringify(countAfterSeed) === JSON.stringify(countAfterImport);
            console.log('\nTest result:');
            if (countsMatch) {
                console.log('✅ SUCCESS: Database export/import test passed! Document counts match.');
            } else {
                console.log('❌ FAIL: Document counts do not match!');
                console.log('Original counts:', countAfterSeed);
                console.log('Imported counts:', countAfterImport);
            }

            // Cleanup: Remove export file
            fs.unlinkSync(exportedFile);
            console.log('\nCleanup: Removed export file');
        } catch (error) {
            console.error('Error during export/import process:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
            }
            throw error;
        }

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        if (error.response) {
            console.error('Server response:', error.response.data);
        }
    } finally {
        // Cleanup: Stop server and disconnect from MongoDB
        if (serverProcess) {
            console.log('Stopping server...');
            serverProcess.kill();
        }
        if (mongoose.connection.readyState !== 0) {
            console.log('Disconnecting from MongoDB...');
            await mongoose.disconnect();
        }
        console.log('\nTest process completed');
        process.exit(0);
    }
}

// Run the test
testDatabaseOperations(); 