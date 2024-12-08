const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

// Import all models
require('../models/Category');
require('../models/Product');
require('../models/Review');
require('../models/Order');
require('../models/User');

const MONGODB_URI = 'mongodb://localhost:27017/ecommerce';

async function exportCollections() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB ecommerce database');

        // Get all models
        const models = mongoose.models;
        const exportData = {};

        // Export each collection
        for (const [modelName, Model] of Object.entries(models)) {
            console.log(`Exporting ${modelName}...`);
            const documents = await Model.find({}).lean();
            exportData[modelName.toLowerCase()] = documents;
            console.log(`✓ Exported ${documents.length} ${modelName} documents`);
        }

        // Create formatted JSON string
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Get current date for filename
        const date = new Date().toISOString().split('T')[0];
        const fileName = `ecommerce-export-${date}.json`;
        
        // Save to file
        await fs.writeFile(fileName, jsonString);
        console.log('\nExport complete! File saved as:', fileName);

    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the export
exportCollections(); 