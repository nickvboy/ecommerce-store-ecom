const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  filterProducts
} = require('../../controllers/productController');

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/filter')
  .post(filterProducts);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router; 