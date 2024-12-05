const mongoose = require('mongoose');
require('dotenv').config();
const { faker } = require('@faker-js/faker');
const Product = require('../models/Product');
const Category = require('../models/Category');
const connectDB = require('../config/db');

// Helper function to get random value from array
const getRandomValue = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random number in range
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random values from checkbox options
const getRandomCheckboxValues = (values, min = 1, max = null) => {
  const count = max ? getRandomNumber(min, Math.min(max, values.length)) : min;
  return faker.helpers.arrayElements(values.map(v => v.value), count);
};

// Helper function to generate attributes based on category
const generateAttributes = async (category) => {
  const attributes = [];
  const categoryPath = await category.getPath();
  
  // Combine attributes from all parent categories
  const allAttributes = categoryPath.reduce((attrs, cat) => {
    return [...attrs, ...cat.attributes];
  }, []);

  // Generate values for each attribute
  for (const attr of allAttributes) {
    switch (attr.type) {
      case 'checkbox':
        attributes.push({
          name: attr.name,
          value: getRandomCheckboxValues(attr.values, 1, 3)
        });
        break;
      case 'radio':
        attributes.push({
          name: attr.name,
          value: getRandomValue(attr.values).value
        });
        break;
      case 'range':
        attributes.push({
          name: attr.name,
          value: getRandomNumber(attr.min, attr.max),
          unit: attr.unit
        });
        break;
    }
  }

  return attributes;
};

// Define base products with specific categories and attributes
const baseProducts = [
  // Your actual products here
  {
    name: "MCM Essential Solution",
    description: "Professional multimeter kit for electronics testing and repair",
    price: 119.99,
    originalPrice: 149.99,
    categoryAlias: "power",
    attributes: [
      { name: "Type", value: "power-bank" },
      { name: "Features", value: ["usb-c", "waterproof"] }
    ],
    stock: 50,
    tags: ["electronics", "testing", "professional"],
    featured: true
  }
];

// Helper function to generate stock levels with varying distributions
const generateStockLevel = () => {
  const rand = Math.random();
  if (rand < 0.1) {  // 10% chance of being out of stock
    return 0;
  } else if (rand < 0.3) {  // 20% chance of low stock (1-5)
    return getRandomNumber(1, 5);
  } else if (rand < 0.6) {  // 30% chance of medium stock (6-20)
    return getRandomNumber(6, 20);
  } else {  // 40% chance of high stock (21-200)
    return getRandomNumber(21, 200);
  }
};

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Get all categories
    const categories = await Category.find({ isActive: true });
    if (categories.length === 0) {
      throw new Error('No categories found. Please run seedCategories first.');
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Create base products
    for (const productData of baseProducts) {
      const category = categories.find(c => c.alias === productData.categoryAlias);
      if (!category) {
        console.warn(`Category ${productData.categoryAlias} not found for ${productData.name}`);
        continue;
      }

      const product = await Product.create({
        ...productData,
        category: category._id
      });
      console.log(`Created product: ${product.name}`);
    }

    // Generate additional random products for each category
    for (const category of categories) {
      // Generate 5-10 products per category
      const numProducts = getRandomNumber(5, 10);
      
      for (let i = 0; i < numProducts; i++) {
        const basePrice = getRandomNumber(20, 200);
        const discountPercent = Math.random() < 0.3 ? Math.random() * 0.4 + 0.1 : 0;
        const attributes = await generateAttributes(category);
        
        const product = await Product.create({
          name: `${faker.commerce.productAdjective()} ${category.name} ${faker.commerce.productAdjective()}`,
          description: faker.commerce.productDescription(),
          price: discountPercent ? parseFloat((basePrice * (1 - discountPercent)).toFixed(2)) : basePrice,
          originalPrice: discountPercent ? parseFloat(basePrice.toFixed(2)) : null,
          category: category._id,
          attributes,
          stock: generateStockLevel(),
          tags: [
            category.name.toLowerCase(),
            faker.commerce.productAdjective().toLowerCase(),
            faker.commerce.productMaterial().toLowerCase()
          ],
          featured: Math.random() < 0.1,
          specifications: {
            materials: [
              {
                name: faker.commerce.productMaterial(),
                description: faker.commerce.productDescription()
              }
            ],
            dimensions: {
              length: parseFloat((Math.random() * 10 + 2).toFixed(1)),
              width: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
              height: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
              weight: parseFloat((Math.random() * 200 + 20).toFixed(1))
            }
          }
        });

        console.log(`Created random product: ${product.name}`);
      }
    }
    
    console.log('Products seeded successfully');
    
    if (require.main === module) {
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

module.exports = seedProducts;

if (require.main === module) {
  seedProducts();
} 