const Order = require('../models/Order');
const Product = require('../models/Product');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    const { email, customerName, items, shippingAddress, totalAmount } = req.body;

    // Validate required fields
    if (!email || !customerName || !items || !shippingAddress || !totalAmount) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['email', 'customerName', 'items', 'shippingAddress', 'totalAmount'],
        received: Object.keys(req.body)
      });
    }

    // Calculate total amount and create order items
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      calculatedTotal += product.price * item.quantity;
    }

    // Create the order
    const order = new Order({
      email,
      customerName,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      status: 'pending'
    });

    // Check if all items are in stock
    try {
      await order.checkStock();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Update stock and save order
    await order.updateStock();
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder._id);

    // Return the order without sensitive information
    res.status(201).json({
      _id: savedOrder._id,
      email: savedOrder.email,
      customerName: savedOrder.customerName,
      items: savedOrder.items,
      totalAmount: savedOrder.totalAmount,
      status: savedOrder.status,
      shippingAddress: savedOrder.shippingAddress,
      createdAt: savedOrder.createdAt
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create order',
      details: error.errors || {}
    });
  }
};

// Get orders by email
exports.getOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ email })
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 