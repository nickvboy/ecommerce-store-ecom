router.post('/:productId/images', productController.addProductImages);
router.patch('/:productId/images/reorder', productController.reorderProductImages);
router.get('/search', productController.searchProducts); 