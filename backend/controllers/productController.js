const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with filtering
exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      search
    } = req.query;

    const query = {};

    // Text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalProducts: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get attribute statistics for filtering
async function getAttributeStats(baseQuery = {}) {
  const products = await Product.find(baseQuery).select('attributes');
  const stats = {};

  products.forEach(product => {
    product.attributes.forEach(attr => {
      if (!stats[attr.name]) {
        stats[attr.name] = new Set();
      }
      stats[attr.name].add(attr.value);
    });
  });

  // Convert sets to arrays and add counts
  return Object.entries(stats).reduce((acc, [name, values]) => {
    acc[name] = Array.from(values).map(value => ({
      value,
      count: products.filter(p => 
        p.attributes.some(a => a.name === name && a.value === value)
      ).length
    }));
    return acc;
  }, {});
}

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name alias');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get category path
    const category = await Category.findById(product.category);
    const categoryPath = await category.getPath();

    // Sort images by order
    product.images.sort((a, b) => a.order - b.order);

    res.json({
      ...product.toObject(),
      categoryPath: categoryPath.map(cat => ({
        _id: cat._id,
        name: cat.name,
        alias: cat.alias
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      attributes,
      stock,
      tags
    } = req.body;

    // Validate category and its attributes
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      attributes: attributes || [],
      stock,
      tags: tags || []
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If images are included in the update, ensure they maintain their order
    if (req.body.images) {
      const orderedImages = req.body.images.map((img, idx) => ({
        url: img.url,
        order: idx
      }));
      req.body.images = orderedImages;
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Advanced filtering
exports.filterProducts = async (req, res) => {
  try {
    const {
      categories,
      priceRange,
      attributes,
      sort,
      page = 1,
      limit = 10
    } = req.body;

    const query = {};

    // Handle category filtering including subcategories
    if (categories?.length) {
      const categoryIds = [];
      for (const categoryId of categories) {
        const category = await Category.findById(categoryId);
        if (category) {
          const children = await category.getAllChildren();
          categoryIds.push(categoryId, ...children.map(c => c._id));
        }
      }
      if (categoryIds.length) {
        query.category = { $in: categoryIds };
      }
    }

    // Price range filter
    if (priceRange) {
      query.price = {
        $gte: priceRange.min,
        $lte: priceRange.max
      };
    }

    // Dynamic attribute filters
    if (attributes) {
      Object.entries(attributes).forEach(([name, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          query['attributes'] = {
            $elemMatch: {
              name,
              value: { $in: values }
            }
          };
        }
      });
    }

    const sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption.price = 1;
          break;
        case 'price_desc':
          sortOption.price = -1;
          break;
        case 'rating':
          sortOption.rating = -1;
          break;
        case 'newest':
          sortOption.createdAt = -1;
          break;
        default:
          sortOption.createdAt = -1;
      }
    }

    const products = await Product.find(query)
      .populate('category')
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    // Get available attribute values for filtering
    const attributeStats = await getAttributeStats(query);

    res.json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      attributeStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get attribute statistics for filtering
async function getAttributeStats(baseQuery = {}) {
  const products = await Product.find(baseQuery).select('attributes');
  const stats = {};

  products.forEach(product => {
    product.attributes.forEach(attr => {
      if (!stats[attr.name]) {
        stats[attr.name] = new Map();
      }
      const count = stats[attr.name].get(attr.value) || 0;
      stats[attr.name].set(attr.value, count + 1);
    });
  });

  // Convert maps to arrays with counts
  return Object.entries(stats).reduce((acc, [name, valueMap]) => {
    acc[name] = Array.from(valueMap.entries()).map(([value, count]) => ({
      value,
      count
    }));
    return acc;
  }, {});
}

// Add images to product
exports.addProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { images } = req.body; // Array of { url, order? }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate images array
    if (!Array.isArray(images)) {
      return res.status(400).json({ message: 'Images must be an array' });
    }

    // Add new images with orders
    const currentMaxOrder = product.images.length > 0 
      ? Math.max(...product.images.map(img => img.order || 0))
      : -1;

    const newImages = images.map((img, idx) => ({
      url: img.url,
      order: typeof img.order === 'number' ? img.order : currentMaxOrder + idx + 1
    }));

    // Sort images by order before adding
    newImages.sort((a, b) => a.order - b.order);

    // Add new images to product
    product.images.push(...newImages);

    // Ensure all images have unique orders
    product.images = product.images.map((img, idx) => ({
      ...img,
      order: idx
    }));

    await product.save();

    res.json({
      message: 'Images added successfully',
      images: product.images
    });
  } catch (error) {
    console.error('Error adding product images:', error);
    res.status(500).json({ 
      message: error.message,
      error: 'Failed to add product images'
    });
  }
};

// Reorder product images
exports.reorderProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageOrders } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate imageOrders
    if (!Array.isArray(imageOrders) || imageOrders.length === 0) {
      return res.status(400).json({ message: 'Invalid image orders' });
    }

    // Validate that all URLs exist in the product
    const productImageUrls = new Set(product.images.map(img => img.url));
    const allUrlsExist = imageOrders.every(img => productImageUrls.has(img.url));
    if (!allUrlsExist) {
      return res.status(400).json({ message: 'Invalid image URLs' });
    }

    // Update image orders
    product.images = imageOrders.map((img, idx) => ({
      url: img.url,
      order: idx
    }));

    await product.save();
    res.json(product.images);
  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({ message: error.message });
  }
};

// Clear all product images
exports.clearProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Store previous images in case we need to rollback
    const previousImages = [...product.images];

    try {
      // Clear the images array
      product.images = [];
      await product.save();

      res.json({ 
        message: 'All product images cleared successfully',
        previousImages // Return previous images in case needed for rollback
      });
    } catch (saveError) {
      // If save fails, try to restore previous state
      product.images = previousImages;
      await product.save();
      throw saveError;
    }
  } catch (error) {
    console.error('Error clearing product images:', error);
    res.status(500).json({ 
      message: error.message,
      error: 'Failed to clear product images'
    });
  }
};

// Other controller methods... 