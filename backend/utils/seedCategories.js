const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');
const connectDB = require('../config/db');

// Define the category hierarchy with attributes
const categoryData = [
  {
    name: 'Apparel',
    alias: 'apparel',
    description: 'High-performance tactical and survival apparel',
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
    ]
  },
  {
    name: 'Core Gear',
    alias: 'core-gear',
    description: 'Essential survival and tactical equipment',
    attributes: [
      {
        name: 'Durability Rating',
        type: 'radio',
        values: [
          { label: 'Standard', value: 'standard' },
          { label: 'Professional', value: 'professional' },
          { label: 'Military-Grade', value: 'military' }
        ]
      }
    ]
  },
  {
    name: 'Performance Base Layers',
    alias: 'base-layers',
    description: 'Technical base layer clothing for optimal performance',
    attributes: [
      {
        name: 'Material',
        type: 'radio',
        values: [
          { label: 'Merino Wool', value: 'merino' },
          { label: 'Synthetic Blend', value: 'synthetic' },
          { label: 'Bamboo Tech', value: 'bamboo' }
        ]
      }
    ]
  },
  {
    name: 'Tactical Bottoms',
    alias: 'tactical-bottoms',
    description: 'Tactical pants and shorts with advanced features',
    attributes: [
      {
        name: 'Style',
        type: 'radio',
        values: [
          { label: 'Cargo Pants', value: 'cargo' },
          { label: 'Combat Pants', value: 'combat' },
          { label: 'Tactical Shorts', value: 'shorts' }
        ]
      }
    ]
  },
  {
    name: 'Hydration Systems',
    alias: 'hydration',
    description: 'Advanced hydration solutions and water management systems',
    attributes: [
      {
        name: 'Capacity',
        type: 'radio',
        values: [
          { label: '1L', value: '1l' },
          { label: '2L', value: '2l' },
          { label: '3L', value: '3l' }
        ]
      }
    ]
  },
  {
    name: 'Insulating Mid Layers',
    alias: 'mid-layers',
    description: 'Thermal regulation and insulating garments',
    attributes: [
      {
        name: 'Insulation Type',
        type: 'radio',
        values: [
          { label: 'Synthetic', value: 'synthetic' },
          { label: 'Down', value: 'down' },
          { label: 'Fleece', value: 'fleece' }
        ]
      }
    ]
  },
  {
    name: 'Protective Outerwear',
    alias: 'outerwear',
    description: 'Weather protection and tactical outer layers',
    attributes: [
      {
        name: 'Weather Rating',
        type: 'radio',
        values: [
          { label: 'Water Resistant', value: 'water-resistant' },
          { label: 'Waterproof', value: 'waterproof' },
          { label: 'All-Weather', value: 'all-weather' }
        ]
      }
    ]
  },
  {
    name: 'Power & Connectivity',
    alias: 'power',
    description: 'Portable power solutions and connectivity gear',
    attributes: [
      {
        name: 'Power Output',
        type: 'radio',
        values: [
          { label: 'Standard', value: 'standard' },
          { label: 'High Output', value: 'high' },
          { label: 'Ultra Capacity', value: 'ultra' }
        ]
      }
    ]
  },
  {
    name: 'Shelter & Environmental Protection',
    alias: 'shelter',
    description: 'Survival shelters and environmental protection equipment',
    attributes: [
      {
        name: 'Shelter Type',
        type: 'radio',
        values: [
          { label: 'Emergency', value: 'emergency' },
          { label: 'Tactical', value: 'tactical' },
          { label: 'Long-Term', value: 'long-term' }
        ]
      }
    ]
  },
  {
    name: 'Tools & Smart Accessories',
    alias: 'tools',
    description: 'Tactical tools and smart survival accessories',
    attributes: [
      {
        name: 'Tool Class',
        type: 'radio',
        values: [
          { label: 'Basic', value: 'basic' },
          { label: 'Advanced', value: 'advanced' },
          { label: 'Professional', value: 'professional' }
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
