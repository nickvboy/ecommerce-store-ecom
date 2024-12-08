const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  filterProducts,
  addProductImages,
  reorderProductImages,
  clearProductImages,
  deleteAllProducts
} = require('../../controllers/productController');
const reviewController = require('../../controllers/reviewController');

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/filter')
  .post(filterProducts);

// Delete all products route
router.delete('/delete-all', deleteAllProducts);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

// Image routes
router.post('/:productId/images', addProductImages);
router.patch('/:productId/images/reorder', reorderProductImages);
router.delete('/:productId/images', clearProductImages);

// Review routes
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', reviewController.createReview);
router.patch('/reviews/:reviewId/likes', reviewController.updateReviewLikes);

module.exports = router; 