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
const reviewController = require('../../controllers/reviewController');

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/filter')
  .post(filterProducts);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

// Review routes
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', reviewController.createReview);
router.patch('/reviews/:reviewId/likes', reviewController.updateReviewLikes);

module.exports = router; 