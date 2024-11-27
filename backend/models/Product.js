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
    user: String,
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
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
  }
});

// Add indexes for common queries
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema); 