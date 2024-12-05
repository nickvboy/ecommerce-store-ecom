const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Encryption key and IV should be stored in environment variables in production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

// Encryption utilities
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  addresses: [{
    _id: false,
    street: { 
      type: String, 
      set: encrypt, 
      get: decrypt,
      required: true 
    },
    city: { 
      type: String, 
      set: encrypt, 
      get: decrypt,
      required: true 
    },
    state: { 
      type: String, 
      set: encrypt, 
      get: decrypt,
      required: true 
    },
    zipCode: { 
      type: String, 
      set: encrypt, 
      get: decrypt,
      required: true 
    },
    country: { 
      type: String, 
      set: encrypt, 
      get: decrypt,
      required: true 
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add getter/setter options only to the addresses subdocument
userSchema.set('toJSON', { 
  getters: true,
  transform: function(doc, ret, options) {
    // Only apply getters to addresses
    if (ret.addresses) {
      ret.addresses = ret.addresses.map(addr => ({
        street: decrypt(addr.street),
        city: decrypt(addr.city),
        state: decrypt(addr.state),
        zipCode: decrypt(addr.zipCode),
        country: decrypt(addr.country),
        isDefault: addr.isDefault
      }));
    }
    return ret;
  }
});

userSchema.set('toObject', { 
  getters: true,
  transform: function(doc, ret, options) {
    // Only apply getters to addresses
    if (ret.addresses) {
      ret.addresses = ret.addresses.map(addr => ({
        street: decrypt(addr.street),
        city: decrypt(addr.city),
        state: decrypt(addr.state),
        zipCode: decrypt(addr.zipCode),
        country: decrypt(addr.country),
        isDefault: addr.isDefault
      }));
    }
    return ret;
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 