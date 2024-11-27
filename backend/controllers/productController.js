const Product = require('../models/Product');

// Get all products with filtering
exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      category,
      minPrice,
      maxPrice,
      search
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
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
      materials,
      ratings,
      tags,
      sort,
      page = 1,
      limit = 10
    } = req.body;

    const query = {};

    if (categories?.length) query.category = { $in: categories };
    if (priceRange) {
      query.price = {
        $gte: priceRange.min,
        $lte: priceRange.max
      };
    }
    if (materials?.length) {
      query['specifications.materials.name'] = { $in: materials };
    }
    if (ratings?.length) {
      query.rating = { $in: ratings };
    }
    if (tags?.length) {
      query.tags = { $in: tags };
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
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Other controller methods... 