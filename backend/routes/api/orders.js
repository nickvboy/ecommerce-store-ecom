const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');
const Order = require('../../models/Order');
const { validateOrder } = require('../../utils/orders');

// @route   GET api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ orderDate: -1 })
      .populate('user', ['name', 'email'])
      .populate('items.product');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/user
// @desc    Get user's orders
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ orderDate: -1 })
      .populate('items.product');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', ['name', 'email'])
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user is admin or if the order belongs to the user
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const validation = validateOrder(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const newOrder = new Order({
      user: req.user.id,
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      totalAmount: req.body.totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = req.body.status || order.status;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;