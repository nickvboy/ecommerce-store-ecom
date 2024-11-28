const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    text: true
  },
  description: {
    type: String,
    required: true,
    text: true
  },
  price: {
    type: Number,
    required: true,
    index: true
  },
  originalPrice: Number,
  category: {
    type: String,
    required: true,
    index: true
  },
  tags: [{
    type: String,
    text: true
  }],
  specifications: {
    materials: [{
      name: { type: String, text: true },
      description: String
    }],
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number
    }
  },
  images: [{
    url: String,
    order: Number
  }],
  stock: {
    type: Number,
    default: 0,
    index: true
  },
  reviewStats: {
    averageRating: { type: Number, default: 0, index: true },
    totalReviews: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound text index with weights
productSchema.index({
  name: 'text',
  description: 'text',
  'specifications.materials.name': 'text',
  tags: 'text',
  category: 'text'
}, {
  weights: {
    name: 15,
    description: 3,
    category: 2,
    tags: 1,
    'specifications.materials.name': 1
  },
  name: "ProductSearchIndex"
});

// Add partial index for active products
productSchema.index(
  { stock: 1 },
  { 
    partialFilterExpression: { stock: { $gt: 0 } },
    name: "InStockIndex"
  }
);

// Add method to search products
productSchema.statics.searchProducts = async function(query, options = {}) {
  const {
    limit = 10,
    page = 1,
    minPrice,
    maxPrice,
    category,
    inStock
  } = options;

  // Build search criteria
  const searchCriteria = {
    $or: [
      { name: { $regex: query, $options: 'i' } },  // Primary title search
      { $text: { $search: query } }                // Fallback full-text search
    ]
  };

  // Add filters
  if (minPrice || maxPrice) {
    searchCriteria.price = {};
    if (minPrice) searchCriteria.price.$gte = Number(minPrice);
    if (maxPrice) searchCriteria.price.$lte = Number(maxPrice);
  }
  if (category) {
    searchCriteria.category = category;
  }
  if (inStock) {
    searchCriteria.stock = { $gt: 0 };
  }

  try {
    const products = await this.find(searchCriteria)
      .select('name price images category stock reviewStats')
      .sort({ 
        score: { $meta: 'textScore' },
        'reviewStats.averageRating': -1
      })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.countDocuments(searchCriteria);

    return {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

module.exports = mongoose.model('Product', productSchema); 