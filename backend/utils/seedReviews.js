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