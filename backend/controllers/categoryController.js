const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name alias')
      .sort('level name');
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category tree
exports.getCategoryTree = async (req, res) => {
  try {
    const rootCategories = await Category.find({ parent: null, isActive: true });
    const tree = [];

    for (const rootCategory of rootCategories) {
      const children = await rootCategory.getAllChildren();
      tree.push({
        ...rootCategory.toObject(),
        children: children.map(child => child.toObject())
      });
    }

    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name alias');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const path = await category.getPath();
    const children = await category.getAllChildren();

    res.json({
      ...category.toObject(),
      path: path.map(cat => ({ _id: cat._id, name: cat.name, alias: cat.alias })),
      children: children.map(child => child.toObject())
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      alias,
      description,
      parent,
      attributes
    } = req.body;

    const category = new Category({
      name,
      alias: alias || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      parent,
      attributes: attributes || []
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category alias must be unique' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if trying to set parent to self or child
    if (req.body.parent) {
      if (req.body.parent === req.params.id) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }
      const children = await category.getAllChildren();
      if (children.some(child => child._id.toString() === req.body.parent)) {
        return res.status(400).json({ message: 'Category cannot be a child of its own child' });
      }
    }

    Object.assign(category, req.body);
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category alias must be unique' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const children = await category.getAllChildren();
    if (children.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with children. Delete or move children first.' 
      });
    }

    const Product = require('../models/Product');
    const hasProducts = await Product.exists({ category: category._id });
    if (hasProducts) {
      // Soft delete by marking as inactive
      category.isActive = false;
      await category.save();
      res.json({ message: 'Category marked as inactive' });
    } else {
      // Hard delete if no products
      await category.delete();
      res.json({ message: 'Category deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category attributes
exports.getCategoryAttributes = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get all parent categories to combine their attributes
    const path = await category.getPath();
    const allAttributes = path.reduce((attrs, cat) => {
      return [...attrs, ...cat.attributes];
    }, []);

    // Remove duplicates based on attribute name
    const uniqueAttributes = Array.from(
      new Map(allAttributes.map(attr => [attr.name, attr])).values()
    );

    res.json(uniqueAttributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 