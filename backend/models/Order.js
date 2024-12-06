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
  customerFirstName: {
    type: String,
    required: true
  },
  customerLastName: {
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
  console.log(`Checking stock for Order ID: ${this._id}`);
  for (const item of this.items) {
    console.log(`Checking product ID: ${item.product}, Quantity: ${item.quantity}`);
    const product = await mongoose.model('Product').findById(item.product);
    if (!product) {
      console.error(`Product not found: ${item.product}`);
      throw new Error(`Insufficient stock for product: Unknown Product`);
    }
    console.log(`Product "${product.name}" has stock: ${product.stock}`);
    if (product.stock < item.quantity) {
      console.error(`Insufficient stock for product: ${product.name}`);
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }
  }
  console.log(`All items are in stock for Order ID: ${this._id}`);
  return true;
};

// Method to update product stock after order
orderSchema.methods.updateStock = async function() {
  console.log(`Updating stock for Order ID: ${this._id}`);
  for (const item of this.items) {
    console.log(`Updating stock for product ID: ${item.product}, Quantity: ${item.quantity}`);
    const product = await mongoose.model('Product').findById(item.product);
    if (!product) {
      console.error(`Product not found: ${item.product}`);
      throw new Error(`Product not found: Unknown Product`);
    }
    
    // Reduce the stock by the ordered quantity
    product.stock -= item.quantity;
    console.log(`Updated stock for product "${product.name}": ${product.stock}`);
    await product.save();
  }
  console.log(`Stock update completed for Order ID: ${this._id}`);
  return true;
};

// Create a new model with the updated schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 