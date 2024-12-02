const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const Review = require('../models/Review');
const connectDB = require('../config/db');
const { faker } = require('@faker-js/faker');

// Helper function to generate normally distributed random numbers
const normalDistribution = (mean, stdDev) => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return Math.round(z * stdDev + mean);
};

const generateReviews = (baseCount = 60) => {
  const count = Math.max(5, normalDistribution(baseCount, baseCount/3));
  
  const reviews = [];
  const ratingWeights = {
    5: 0.42,  // About 42% (22 reviews)
    4: 0.34,  // About 34% (18 reviews)
    3: 0.15,  // About 15% (8 reviews)
    2: 0.07,  // About 7% (4 reviews)
    1: 0.02   // About 2% (1 review)
  };

  // Rating-specific templates
  const reviewTemplatesByRating = {
    1: [
      "Extremely disappointed with the {feature}. {negative_point}.",
      "Terrible {feature}. {negative_point} Would not recommend.",
      "Waste of money. {negative_point}.",
      "Poor quality {feature}. {negative_point}.",
      "Regret this purchase. {negative_point}."
    ],
    2: [
      "Below expectations. {feature} is {negative_quality}.",
      "Not worth the price. {negative_point}.",
      "Mediocre {feature}. {mixed_experience}.",
      "Several issues with {feature}. {negative_point}.",
      "Underwhelming product. {mixed_experience}."
    ],
    3: [
      "Average {feature}. {mixed_experience}.",
      "Decent but not great. {mixed_experience}.",
      "Mixed feelings about this. {mixed_experience}.",
      "OK for the price. {mixed_experience}.",
      "Could be better. {mixed_experience}."
    ],
    4: [
      "Generally pleased with the {feature}. {positive_point}.",
      "Good product overall. {positive_point}.",
      "Mostly satisfied. {positive_point}.",
      "Better than expected. {positive_point}.",
      "Nice {feature}, but {minor_issue}."
    ],
    5: [
      "Absolutely perfect! {feature} is {positive_quality}.",
      "Exceeded all expectations! {positive_point}.",
      "Outstanding quality. {positive_point}.",
      "Best purchase ever! {positive_point}.",
      "Couldn't be happier! {positive_point}."
    ]
  };

  const negativePoints = [
    "Poor build quality",
    "Breaks easily",
    "Not worth the money",
    "Customer service was unhelpful",
    "Doesn't work as advertised",
    "Major design flaws",
    "Uncomfortable to use",
    "Feels cheap"
  ];

  const mixedExperiences = [
    "has some good features but needs improvement",
    "works okay for basic needs",
    "decent for the price but nothing special",
    "functional but lacks refinement",
    "acceptable quality but overpriced"
  ];

  const positivePoints = [
    "Excellent build quality",
    "Great value for money",
    "Performs beautifully",
    "Exceeds expectations",
    "Perfect for daily use"
  ];

  const negativeQualities = [
    "subpar",
    "disappointing",
    "inadequate",
    "flimsy",
    "unreliable"
  ];

  const positiveQualities = [
    "outstanding",
    "exceptional",
    "superb",
    "excellent",
    "perfect"
  ];

  const minorIssues = [
    "could use minor improvements",
    "slightly expensive",
    "small design quirks",
    "minor inconveniences",
    "few minor drawbacks"
  ];

  const features = [
    "build quality", "design", "functionality", "durability", "performance", "material",
    "craftsmanship", "finish", "ergonomics", "balance", "precision", "reliability"
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

    // Select template based on rating
    const templates = reviewTemplatesByRating[rating];
    const template = templates[Math.floor(Math.random() * templates.length)]
      .replace("{feature}", features[Math.floor(Math.random() * features.length)])
      .replace("{negative_point}", negativePoints[Math.floor(Math.random() * negativePoints.length)])
      .replace("{mixed_experience}", mixedExperiences[Math.floor(Math.random() * mixedExperiences.length)])
      .replace("{positive_point}", positivePoints[Math.floor(Math.random() * positivePoints.length)])
      .replace("{negative_quality}", negativeQualities[Math.floor(Math.random() * negativeQualities.length)])
      .replace("{positive_quality}", positiveQualities[Math.floor(Math.random() * positiveQualities.length)])
      .replace("{minor_issue}", minorIssues[Math.floor(Math.random() * minorIssues.length)]);

    // Generate title based on rating
    const titlePrefix = rating <= 2 ? 
      faker.word.adjective({ strategy: 'any' }) : 
      faker.commerce.productAdjective();

    reviews.push({
      userName: faker.person.fullName(),
      location: `${faker.location.city()}, ${faker.location.countryCode()}`,
      rating,
      title: `${titlePrefix} ${features[Math.floor(Math.random() * features.length)]}`,
      content: template,
      likes: faker.number.int({ min: 0, max: rating * 20 }), // More likes for higher ratings
      dislikes: faker.number.int({ min: 0, max: (6 - rating) * 2 }), // More dislikes for lower ratings
      date: faker.date.past({ years: 1 })
    });
  }

  return reviews;
};

const seedReviews = async () => {
  try {
    await connectDB();
    
    // Clear existing reviews
    await Review.deleteMany({});
    console.log('Cleared existing reviews');
    
    // Get all products
    const products = await Product.find({});
    
    // Generate and insert reviews for each product
    for (const product of products) {
      const reviewData = generateReviews();
      const createdReviews = await Review.insertMany(
        reviewData.map(review => ({
          ...review,
          product: product._id
        }))
      );
      
      // Associate reviews with the product
      product.reviews = createdReviews.map(review => review._id);
      await product.updateReviewStats();
      await product.save();
      console.log(`Generated ${createdReviews.length} reviews for ${product.name}`);
    }
    
    mongoose.connection.close();
    console.log('Reviews seeded successfully');
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
};

module.exports = seedReviews;

if (require.main === module) {
  seedReviews();
} 