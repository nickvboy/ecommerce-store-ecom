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
  stock: {
    type: Number,
    required: true
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      // Sort images by order before converting to JSON
      if (ret.images) {
        ret.images.sort((a, b) => a.order - b.order);
      }
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Sort images by order before converting to object
      if (ret.images) {
        ret.images.sort((a, b) => a.order - b.order);
      }
      return ret;
    }
  }
});

// Pre-save middleware to validate attributes and sort images
productSchema.pre('save', async function(next) {
  if (this.isModified('attributes') || this.isModified('category')) {
    await this.validateAttributes();
  }
  
  // Sort and reindex image orders before saving
  if (this.images && this.images.length > 0) {
    this.images.sort((a, b) => a.order - b.order);
    this.images = this.images.map((img, idx) => ({
      url: img.url,
      order: idx
    }));
  }
  
  next();
});

// Method to reorder images
productSchema.methods.reorderImages = function(imageOrders) {
  const orderMap = new Map(imageOrders.map(img => [img.url, img.order]));
  
  // Create a new array with updated orders
  const reorderedImages = this.images
    .map(img => ({
      url: img.url,
      order: orderMap.has(img.url) ? orderMap.get(img.url) : img.order
    }))
    .sort((a, b) => a.order - b.order)
    .map((img, idx) => ({
      url: img.url,
      order: idx
    }));

  this.images = reorderedImages;
  return this.images;
};

// Method to validate attributes
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

// Add method to update review stats
productSchema.methods.updateReviewStats = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ product: this._id });
  
  if (reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / reviews.length;
    this.totalReviews = reviews.length;
  }
  
  await this.save();
};

module.exports = mongoose.model('Product', productSchema); 