const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function importDatabase(filename) {
    try {
        console.log('Starting database import process...');
        
        // Check if file exists
        const filePath = path.join(process.cwd(), filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filename}`);
        }
        console.log('Found import file:', filePath);

        // Read and validate JSON file
        console.log('Reading file contents...');
        const fileData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileData);
        
        if (!jsonData.data) {
            throw new Error('Invalid file format: missing "data" property');
        }
        console.log('File contents validated successfully');

        // Clear the database first
        console.log('Clearing existing database...');
        const clearResponse = await axios.post('http://localhost:5001/api/database/clear');
        console.log('Clear response:', clearResponse.data);

        // Send the data to the import endpoint
        console.log('Importing new data...');
        console.log('Data summary:', {
            users: jsonData.data.users?.length || 0,
            products: jsonData.data.products?.length || 0,
            categories: jsonData.data.categories?.length || 0,
            orders: jsonData.data.orders?.length || 0,
            reviews: jsonData.data.reviews?.length || 0
        });

        const response = await axios.post('http://localhost:5001/api/database/import', {
            data: jsonData.data
        });

        console.log('Import completed successfully:', response.data);
    } catch (error) {
        console.error('Import failed with error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Could not connect to the server. Make sure the server is running on port 5001');
        }
        if (error.response) {
            console.error('Server response:', error.response.data);
        }
        if (error.request) {
            console.error('No response received from server');
        }
        process.exit(1);
    }
}

// Get filename from command line argument
const filename = process.argv[2];
if (!filename) {
    console.error('Please provide a filename. Usage: node importDatabase.js <filename>');
    process.exit(1);
}

importDatabase(filename); 