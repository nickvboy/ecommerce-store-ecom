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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  attributes: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    unit: String
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
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
}, {
  timestamps: true
});

// Add indexes for common queries
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ 'attributes.name': 1, 'attributes.value': 1 });

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

// Method to validate attributes against category requirements
productSchema.methods.validateAttributes = async function() {
  const Category = mongoose.model('Category');
  const category = await Category.findById(this.category);
  
  if (!category) {
    throw new Error('Invalid category');
  }

  const requiredAttributes = category.attributes.filter(attr => attr.required);
  const productAttributeNames = this.attributes.map(attr => attr.name);

  for (const reqAttr of requiredAttributes) {
    if (!productAttributeNames.includes(reqAttr.name)) {
      throw new Error(`Missing required attribute: ${reqAttr.name}`);
    }

    const productAttr = this.attributes.find(attr => attr.name === reqAttr.name);
    
    if (reqAttr.type === 'range') {
      if (productAttr.value < reqAttr.min || productAttr.value > reqAttr.max) {
        throw new Error(`${reqAttr.name} must be between ${reqAttr.min} and ${reqAttr.max}`);
      }
    } else if (reqAttr.type === 'checkbox' || reqAttr.type === 'radio') {
      const validValues = reqAttr.values.map(v => v.value);
      if (!validValues.includes(productAttr.value)) {
        throw new Error(`Invalid value for ${reqAttr.name}`);
      }
    }
  }
};

// Pre-save middleware to validate attributes
productSchema.pre('save', async function(next) {
  if (this.isModified('attributes') || this.isModified('category')) {
    await this.validateAttributes();
  }
  next();
});

// Add this method to the productSchema
productSchema.methods.reorderImages = function(imageOrders) {
  // Create a map of url to order for quick lookup
  const orderMap = new Map(imageOrders.map(img => [img.url, img.order]));
  
  // Update orders of existing images
  this.images = this.images
    .map(img => ({
      url: img.url,
      order: orderMap.has(img.url) ? orderMap.get(img.url) : img.order
    }))
    .sort((a, b) => a.order - b.order);
  
  return this.images;
};

module.exports = mongoose.model('Product', productSchema); 