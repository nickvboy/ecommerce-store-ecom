const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryAttributes
} = require('../../controllers/categoryController');

// Get all categories or tree structure
router.get('/', getCategories);
router.get('/tree', getCategoryTree);

// CRUD operations on individual categories
router.post('/', createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

// Get category attributes (including inherited from parents)
router.get('/:id/attributes', getCategoryAttributes);

module.exports = router; 