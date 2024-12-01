const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const Review = require('../models/Review');
const { faker } = require('@faker-js/faker');

const connectDB = require('../config/db');

// Helper function to generate normally distributed random numbers
const normalDistribution = (mean, stdDev) => {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return Math.round(z * stdDev + mean);
};

// Define the generateReviews function before using it
const generateReviews = (baseCount = 60) => {
  // Generate a random count with normal distribution
  // mean = baseCount, standard deviation = baseCount/3
  // Ensure minimum of 5 reviews
  const count = Math.max(5, normalDistribution(baseCount, baseCount/3));
  
  const reviews = [];
  const ratingWeights = {
    5: 0.4,
    4: 0.35,
    3: 0.15,
    2: 0.07,
    1: 0.03
  };

  const reviewTemplates = [
    "Absolutely {adjective}! {feature} is {quality}.",
    "The {feature} is {quality}. {conclusion}",
    "{timeOwned} and {experience}.",
    "Purchased for {useCase} and {conclusion}.",
    "{quality} product overall. {feature} {experience}.",
    "As a {useCase} enthusiast, {experience}.",
    "After {timeOwned}, I can say {conclusion}.",
    "The {feature} really {quality}. {experience}.",
    "Perfect for {useCase}! {conclusion}",
    "Compared to others, this {feature} is {adjective}."
  ];

  const adjectives = [
    "amazing", "fantastic", "outstanding", "excellent", "incredible", "superb",
    "brilliant", "remarkable", "exceptional", "magnificent", "stellar", "impressive"
  ];
  const features = [
    "build quality", "design", "functionality", "durability", "performance", "material",
    "craftsmanship", "finish", "ergonomics", "balance", "precision", "reliability"
  ];
  const qualities = [
    "top-notch", "exceptional", "impressive", "remarkable", "solid", "premium",
    "outstanding", "superior", "excellent", "first-rate", "unmatched", "phenomenal"
  ];
  const experiences = [
    "exceeded my expectations",
    "couldn't be happier",
    "very satisfied with the purchase",
    "works perfectly for my needs",
    "definitely worth the investment",
    "it's become my daily favorite",
    "I'm thoroughly impressed",
    "it's a game changer",
    "it's exceeded all my requirements",
    "I'm completely satisfied"
  ];
  const timeOwned = [
    "Been using for several months",
    "Had it for a year now",
    "Using it daily for weeks",
    "Recently purchased",
    "Been testing for a while",
    "After six months of use",
    "Three months in",
    "Two weeks of daily use",
    "After extensive testing",
    "Following months of regular use"
  ];
  const useCases = [
    "everyday carry",
    "professional use",
    "outdoor activities",
    "office work",
    "travel companion",
    "EDC enthusiast",
    "collector",
    "minimalist",
    "professional writer",
    "design professional"
  ];
  const conclusions = [
    "highly recommend it",
    "exactly what I was looking for",
    "great value for money",
    "would buy again",
    "perfect for my needs",
    "exceeded my expectations",
    "worth every penny",
    "couldn't be happier",
    "best purchase this year",
    "absolutely love it"
  ];

  for (let i = 0; i < count; i++) {
    const random = Math.random();
    let rating = 5;
    let sum = 0;
    for (const [r, weight] of Object.entries(ratingWeights)) {
      sum += weight;
      if (random <= sum) {
        rating = parseInt(r);
        break;
      }
    }

    // Generate more varied review content
    const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)]
      .replace("{adjective}", adjectives[Math.floor(Math.random() * adjectives.length)])
      .replace("{feature}", features[Math.floor(Math.random() * features.length)])
      .replace("{quality}", qualities[Math.floor(Math.random() * qualities.length)])
      .replace("{experience}", experiences[Math.floor(Math.random() * experiences.length)])
      .replace("{timeOwned}", timeOwned[Math.floor(Math.random() * timeOwned.length)])
      .replace("{useCase}", useCases[Math.floor(Math.random() * useCases.length)])
      .replace("{conclusion}", conclusions[Math.floor(Math.random() * conclusions.length)]);

    reviews.push({
      userName: faker.person.fullName(),
      location: `${faker.location.city()}, ${faker.location.countryCode()}`,
      rating,
      title: faker.commerce.productAdjective() + " " + features[Math.floor(Math.random() * features.length)],
      content: template,
      likes: faker.number.int({ min: 0, max: 100 }),
      dislikes: faker.number.int({ min: 0, max: 10 }),
      date: faker.date.past({ years: 1 })
    });
  }

  return reviews;
};

const generateProductImages = (productId, count = 6) => {
  return Array(count).fill(null).map((_, index) => ({
    url: `https://picsum.photos/seed/${productId}-${index}/800/800`,
    order: index
  }));
};

const products = [
  {
    name: "SCRIBEDRIVER BOLT ACTION PEN",
    description: "Premium bolt action pen with precision engineering",
    price: 19.99,
    originalPrice: 29.99,
    category: "Pens",
    images: generateProductImages('scribedriver'),
    rating: 4.5,
    reviews: [
      {
        userName: "John D.",
        location: "Florida, US",
        rating: 5,
        title: "Best pen I've ever used!",
        content: "This pen exceeded my expectations. The build quality is outstanding and it writes smoothly.",
        likes: 12,
        dislikes: 1,
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
    images: generateProductImages(`product-${i + 2}`),
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3 and 5
    reviews: generateReviews(), // Generate dynamic reviews
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

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing products and reviews
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing products and reviews');
    
    // Insert new products
    for (const productData of products) {
      const { reviews: reviewData, ...productInfo } = productData;
      const product = await Product.create(productInfo);
      console.log(`Created product: ${product.name}`);
      
      // Insert reviews
      const createdReviews = await Review.insertMany(reviewData.map(review => ({
        ...review,
        product: product._id
      })));
      console.log(`Generated ${createdReviews.length} reviews for ${product.name}`);
      
      // Associate reviews with the product
      product.reviews = createdReviews.map(review => review._id);
      await product.updateReviewStats();
      await product.save();
      console.log(`Updated review stats for ${product.name}`);
    }
    
    mongoose.connection.close();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB(); 