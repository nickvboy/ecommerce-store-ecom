const mongoose = require('mongoose');

// Clear any existing models
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Orders must have at least one item']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'United States'
    }
  }
}, {
  timestamps: true,
  strict: true,
  validateBeforeSave: true
});

// Method to check if all items are in stock
orderSchema.methods.checkStock = async function() {
  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.product);
    if (!product || product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product ? product.name : 'Unknown Product'}`);
    }
  }
  return true;
};

// Method to update product stock after order
orderSchema.methods.updateStock = async function() {
  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.product);
    product.stock -= item.quantity;
    await product.save();
  }
};

// Create a new model with the updated schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 