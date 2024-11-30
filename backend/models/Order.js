const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
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
    },
    variant: {
      name: String,
      value: String,
      priceModifier: {
        type: Number,
        default: 0
      }
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add method to calculate total amount
orderSchema.methods.calculateTotal = function() {
  return this.items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    const variantModifier = item.variant?.priceModifier || 0;
    return total + itemTotal + (variantModifier * item.quantity);
  }, 0);
};

// Pre-save middleware to update total amount
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalAmount = this.calculateTotal();
  }
  next();
});

// Virtual for order number (for display purposes)
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().slice(-6).toUpperCase()}`;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 