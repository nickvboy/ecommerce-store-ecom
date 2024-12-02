const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');
const connectDB = require('../config/db');

// Define the category hierarchy with attributes
const categoryData = [
  {
    name: 'Clothing',
    alias: 'clothing',
    description: 'Technical and survival apparel',
    attributes: [
      {
        name: 'Size',
        type: 'radio',
        values: [
          { label: 'Small', value: 'S' },
          { label: 'Medium', value: 'M' },
          { label: 'Large', value: 'L' },
          { label: 'X-Large', value: 'XL' },
          { label: '2X-Large', value: 'XXL' }
        ]
      }
    ],
    subcategories: [
      {
        name: 'Outerwear',
        alias: 'outerwear',
        description: 'Technical jackets and protective layers',
        attributes: [
          {
            name: 'Type',
            type: 'radio',
            values: [
              { label: 'Windbreaker', value: 'windbreaker' },
              { label: 'Jacket', value: 'jacket' },
              { label: 'Poncho', value: 'poncho' },
              { label: 'Vest', value: 'vest' }
            ]
          },
          {
            name: 'Features',
            type: 'checkbox',
            values: [
              { label: 'Waterproof', value: 'waterproof' },
              { label: 'Solar Integration', value: 'solar' },
              { label: 'RFID Blocking', value: 'rfid' },
              { label: 'Packable', value: 'packable' },
              { label: 'Reflective', value: 'reflective' }
            ]
          }
        ]
      },
      {
        name: 'Base Layers',
        alias: 'base-layers',
        description: 'Technical shirts and compression wear',
        attributes: [
          {
            name: 'Type',
            type: 'radio',
            values: [
              { label: 'T-Shirt', value: 't-shirt' },
              { label: 'Base Layer', value: 'base-layer' },
              { label: 'Compression', value: 'compression' }
            ]
          },
          {
            name: 'Features',
            type: 'checkbox',
            values: [
              { label: 'Moisture Wicking', value: 'wicking' },
              { label: 'UV Protection', value: 'uv-protection' },
              { label: 'Thermal Regulation', value: 'thermal' },
              { label: 'RFID Blocking', value: 'rfid' }
            ]
          }
        ]
      },
      {
        name: 'Bottoms',
        alias: 'bottoms',
        description: 'Technical pants and shorts',
        attributes: [
          {
            name: 'Type',
            type: 'radio',
            values: [
              { label: 'Convertible Pants', value: 'convertible' },
              { label: 'Tactical Pants', value: 'tactical' },
              { label: 'Shorts', value: 'shorts' }
            ]
          },
          {
            name: 'Features',
            type: 'checkbox',
            values: [
              { label: 'Water Repellent', value: 'water-repellent' },
              { label: 'Hidden Compartments', value: 'hidden-compartments' },
              { label: 'Adjustable', value: 'adjustable' }
            ]
          }
        ]
      },
      {
        name: 'Mid Layers',
        alias: 'mid-layers',
        description: 'Hoodies and insulating layers',
        attributes: [
          {
            name: 'Type',
            type: 'radio',
            values: [
              { label: 'Hoodie', value: 'hoodie' },
              { label: 'Fleece', value: 'fleece' },
              { label: 'Thermal', value: 'thermal' }
            ]
          },
          {
            name: 'Features',
            type: 'checkbox',
            values: [
              { label: 'LED Integration', value: 'led' },
              { label: 'Hidden Compartments', value: 'hidden-compartments' },
              { label: 'Thermal Lined', value: 'thermal-lined' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Gear',
    alias: 'gear',
    description: 'Survival and technical equipment',
    attributes: [
      {
        name: 'Waterproof Rating',
        type: 'radio',
        values: [
          { label: 'Water Resistant', value: 'resistant' },
          { label: 'Waterproof', value: 'waterproof' },
          { label: 'Not Rated', value: 'none' }
        ]
      }
    ],
    subcategories: [
      {
        name: 'Shelter & Protection',
        alias: 'shelter',
        description: 'Tents and protective equipment',
        attributes: [
          {
            name: 'Type',
            type: 'radio',
            values: [
              { label: 'Tent', value: 'tent' },
              { label: 'Tarp', value: 'tarp' },
              { label: 'Bivy', value: 'bivy' }
            ]
          },
          {
            name: 'Features',
            type: 'checkbox',
            values: [
              { label: 'Solar Integration', value: 'solar' },
              { label: 'USB Charging', value: 'usb' },
              { label: 'Emergency Beacon', value: 'beacon' }
            ]
          }
        ]
      },
      {
        name: 'Power & Electronics',
        alias: 'power',
        description: 'Power banks and electronic equipment',
        attributes: [
          {
            name: 'Type',
            type: 'radio',
            values: [
              { label: 'Solar Panel', value: 'solar-panel' },
              { label: 'Power Bank', value: 'power-bank' },
              { label: 'Emergency Light', value: 'light' }
            ]
          },
          {
            name: 'Features',
            type: 'checkbox',
            values: [
              { label: 'Solar Charging', value: 'solar-charging' },
              { label: 'USB-C', value: 'usb-c' },
              { label: 'Waterproof', value: 'waterproof' }
            ]
          }
        ]
      },
      {
        name: 'Tools & Accessories',
        alias: 'tools',
        description: 'Multi-tools and survival accessories',
        attributes: [
          {
            name: 'Type',
            type: 'radio',
            values: [
              { label: 'Multi-tool', value: 'multi-tool' },
              { label: 'Survival Kit', value: 'survival-kit' },
              { label: 'Accessories', value: 'accessories' }
            ]
          },
          {
            name: 'Features',
            type: 'checkbox',
            values: [
              { label: 'Compact', value: 'compact' },
              { label: 'Modular', value: 'modular' },
              { label: 'Weatherproof', value: 'weatherproof' }
            ]
          }
        ]
      },
      {
        name: 'Hydration',
        alias: 'hydration',
        description: 'Water bottles and filtration',
        attributes: [
          {
            name: 'Type',
            type: 'radio',
            values: [
              { label: 'Water Bottle', value: 'bottle' },
              { label: 'Filter', value: 'filter' },
              { label: 'Reservoir', value: 'reservoir' }
            ]
          },
          {
            name: 'Features',
            type: 'checkbox',
            values: [
              { label: 'Collapsible', value: 'collapsible' },
              { label: 'Filtration', value: 'filtration' },
              { label: 'Insulated', value: 'insulated' }
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to create categories recursively
async function createCategoriesRecursive(categories, parentId = null) {
  const createdCategories = [];

  for (const categoryInfo of categories) {
    const { subcategories, ...categoryData } = categoryInfo;
    
    // Create the category
    const category = new Category({
      ...categoryData,
      parent: parentId
    });
    
    await category.save();
    console.log(`Created category: ${category.name}`);

    // Recursively create subcategories if they exist
    if (subcategories && subcategories.length > 0) {
      const children = await createCategoriesRecursive(subcategories, category._id);
      createdCategories.push({ ...category.toObject(), children });
    } else {
      createdCategories.push(category.toObject());
    }
  }

  return createdCategories;
}

const seedCategories = async () => {
  try {
    await connectDB();
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Create categories
    const categories = await createCategoriesRecursive(categoryData);
    console.log('Categories created successfully');
    
    // Close connection if running directly
    if (require.main === module) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }

    return categories;
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

module.exports = seedCategories;

if (require.main === module) {
  seedCategories();
}
