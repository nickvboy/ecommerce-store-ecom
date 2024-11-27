const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  specifications: {
    materials: [{
      name: String,
      description: String
    }],
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number
    }
  },
  variants: [{
    name: { type: String },
    type: { type: String },
    options: [{
      value: { type: String },
      available: { type: Boolean },
      priceModifier: { type: Number }
    }]
  }],
  stock: {
    type: Number,
    required: true
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewStats: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    ratingDistribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  }
});

// Add indexes for common queries
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

// Method to update review statistics
productSchema.methods.updateReviewStats = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ product: this._id });
  
  if (reviews.length === 0) {
    this.reviewStats = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  } else {
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = parseFloat((total / reviews.length).toFixed(2));
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });
    
    this.reviewStats = {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution
    };
  }
  
  await this.save();
};

module.exports = mongoose.model('Product', productSchema); 