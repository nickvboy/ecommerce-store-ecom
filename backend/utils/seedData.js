const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

const connectDB = require('../config/db');

const products = [
  // Pens Category
  {
    name: "SCRIBEDRIVER BOLT ACTION PEN",
    description: "Premium bolt action pen with precision engineering",
    price: 19.99,
    originalPrice: 29.99,
    category: "Pens",
    images: [
      "/images/scribedriver/blue.jpg",
      "/images/scribedriver/red.jpg",
      "/images/scribedriver/green.jpg",
      "/images/scribedriver/yellow.jpg",
      "/images/scribedriver/purple.jpg",
      "/images/scribedriver/orange.jpg"
    ],
    rating: 4.5,
    reviews: [
      {
        user: "John D.",
        rating: 5,
        comment: "Best pen I've ever used!",
        date: new Date("2024-01-15")
      }
    ],
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

// Generate 49 more products with variations
const categories = ["Pens", "Tools", "EDC Gear", "Accessories", "Bundles"];
const materials = ["Titanium", "Brass", "Copper", "Carbon Fiber", "Stainless Steel"];
const tags = ["EDC", "writing", "tool", "premium", "limited edition", "everyday carry", "metal", "custom"];

for (let i = 0; i < 49; i++) {
  const basePrice = Math.floor(Math.random() * 200) + 20;
  const discountPercent = Math.random() < 0.3 ? Math.random() * 0.4 + 0.1 : 0; // 30% chance of discount
  
  const product = {
    name: `EDC ${categories[Math.floor(Math.random() * categories.length)]} ${i + 2}`,
    description: `Premium EDC product with high-quality materials and precision engineering.`,
    price: discountPercent ? basePrice * (1 - discountPercent) : basePrice,
    originalPrice: discountPercent ? basePrice : null,
    category: categories[Math.floor(Math.random() * categories.length)],
    images: Array(6).fill(null).map((_, index) => `/images/product-${i + 2}/image-${index + 1}.jpg`),
    rating: Math.random() * 2 + 3, // Rating between 3 and 5
    reviews: Array(Math.floor(Math.random() * 20) + 1).fill(null).map(() => ({
      user: `User${Math.floor(Math.random() * 1000)}`,
      rating: Math.floor(Math.random() * 5) + 1,
      comment: "Great product, exactly as described!",
      date: new Date(Date.now() - Math.random() * 10000000000)
    })),
    specifications: {
      materials: materials
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map(material => ({
          name: material,
          description: `High-quality ${material.toLowerCase()} component`
        })),
      dimensions: {
        length: Math.random() * 10 + 2,
        width: Math.random() * 2 + 0.5,
        height: Math.random() * 2 + 0.5,
        weight: Math.random() * 200 + 20
      }
    },
    variants: [
      {
        name: "Material",
        type: "material",
        options: materials
          .slice(0, Math.floor(Math.random() * 3) + 2)
          .map(material => ({
            value: material,
            available: Math.random() > 0.2,
            priceModifier: Math.floor(Math.random() * 50)
          }))
      }
    ],
    stock: Math.floor(Math.random() * 200) + 10,
    tags: [...new Set([...tags].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2))],
    featured: Math.random() < 0.1 // 10% chance of being featured
  };
  
  products.push(product);
}

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    await Product.insertMany(products);
    console.log('Successfully seeded 50 products');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB(); 