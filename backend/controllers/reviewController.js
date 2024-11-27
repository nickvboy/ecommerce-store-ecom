const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

// Fetch reviews for a specific product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userName, location, rating, title, content } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = new Review({ product: productId, userName, location, rating, title, content });
    await review.save();

    // Update product's review statistics
    await product.updateReviewStats();

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update likes or dislikes on a review
exports.updateReviewLikes = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action } = req.body; // 'like' or 'dislike'

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (action === 'like') {
      review.likes += 1;
    } else if (action === 'dislike') {
      review.dislikes += 1;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 