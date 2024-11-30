const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getOrdersByEmail
} = require('../../controllers/orderController');

// Create new order
router.post('/', createOrder);

// Get orders by email
router.get('/email/:email', getOrdersByEmail);

// Get specific order
router.get('/:orderId', getOrderById);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

module.exports = router; 