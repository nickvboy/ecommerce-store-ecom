const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  addToWishlist,
  removeFromWishlist,
  getAllUsers,
  getUserById
} = require('../../controllers/userController');
const { auth } = require('../../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/address', auth, addAddress);
router.post('/wishlist', auth, addToWishlist);
router.delete('/wishlist/:productId', auth, removeFromWishlist);

// Admin routes
router.get('/admin/list', auth, getAllUsers);
router.get('/admin/:userId', auth, getUserById);

module.exports = router; 