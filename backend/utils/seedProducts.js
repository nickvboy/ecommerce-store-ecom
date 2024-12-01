const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const connectDB = require('../config/db');

// Define product data
const products = [
  {
    name: "SCRIBEDRIVER BOLT ACTION PEN",
    description: "Premium bolt action pen with precision engineering",
    price: 19.99,
    originalPrice: 29.99,
    category: "Pens",
    images: [], // Empty images array
    rating: 4.5,
    specifications: {
      materials: [
        {
          name: "303 Stainless steel",
          description: "Body material"
        },
        {
          name: "Lead free brass",
          description: "Bolt material option"
        }
      ],
      dimensions: {
        length: 5.5,
        width: 0.5,
        height: 0.5,
        weight: 45
      }
    },
    variants: [
      {
        name: "Bolt Material",
        type: "material",
        options: [
          {
            value: "Stainless Steel",
            available: true,
            priceModifier: 0
          },
          {
            value: "Brass",
            available: true,
            priceModifier: 5
          }
        ]
      }
    ],
    stock: 100,
    tags: ["pen", "writing", "EDC", "metal pen"],
    featured: true
  }
];

// Generate additional products
const categoriesList = ["Pens", "Tools", "EDC Gear", "Accessories", "Bundles"];
const materialsList = ["Titanium", "Brass", "Copper", "Carbon Fiber", "Stainless Steel"];
const tagsList = ["EDC", "writing", "tool", "premium", "limited edition", "everyday carry", "metal", "custom"];

for (let i = 0; i < 49; i++) {
  const basePrice = Math.floor(Math.random() * 200) + 20;
  const discountPercent = Math.random() < 0.3 ? Math.random() * 0.4 + 0.1 : 0; // 30% chance of discount
  
  const product = {
    name: `EDC ${categoriesList[Math.floor(Math.random() * categoriesList.length)]} ${i + 2}`,
    description: `Premium EDC product with high-quality materials and precision engineering.`,
    price: discountPercent ? parseFloat((basePrice * (1 - discountPercent)).toFixed(2)) : basePrice,
    originalPrice: discountPercent ? parseFloat(basePrice.toFixed(2)) : null,
    category: categoriesList[Math.floor(Math.random() * categoriesList.length)],
    images: [], // Empty images array
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3 and 5
    specifications: {
      materials: materialsList
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map(material => ({
          name: material,
          description: `High-quality ${material.toLowerCase()} component`
        })),
      dimensions: {
        length: parseFloat((Math.random() * 10 + 2).toFixed(1)),
        width: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
        height: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
        weight: parseFloat((Math.random() * 200 + 20).toFixed(1))
      }
    },
    variants: [
      {
        name: "Material",
        type: "material",
        options: materialsList
          .slice(0, Math.floor(Math.random() * 3) + 2)
          .map(material => ({
            value: material,
            available: Math.random() > 0.2,
            priceModifier: Math.floor(Math.random() * 50)
          }))
      }
    ],
    stock: Math.floor(Math.random() * 200) + 10,
    tags: [...new Set([...tagsList].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2))],
    featured: Math.random() < 0.1 // 10% chance of being featured
  };
  
  products.push(product);
}

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    for (const productData of products) {
      const { reviews: reviewData, ...productInfo } = productData;
      const product = await Product.create(productInfo);
      console.log(`Created product: ${product.name}`);
    }
    
    mongoose.connection.close();
    console.log('Products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

module.exports = seedProducts;

if (require.main === module) {
  seedProducts();
} 