const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['checkbox', 'radio', 'range'],
    required: true
  },
  values: [{
    label: String,
    value: String
  }],
  unit: String, // For range types (e.g., "inches", "lbs")
  min: Number, // For range types
  max: Number, // For range types
  required: {
    type: Boolean,
    default: false
  }
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  alias: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  attributes: [attributeSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
categorySchema.index({ parent: 1 });
categorySchema.index({ alias: 1 }, { unique: true });

// Method to get full path of category names
categorySchema.methods.getPath = async function() {
  const path = [this];
  let currentCategory = this;

  while (currentCategory.parent) {
    currentCategory = await this.constructor.findById(currentCategory.parent);
    if (!currentCategory) break;
    path.unshift(currentCategory);
  }

  return path;
};

// Method to get all children categories (recursive)
categorySchema.methods.getAllChildren = async function() {
  const children = await this.constructor.find({ parent: this._id });
  let allChildren = [...children];

  for (const child of children) {
    const grandChildren = await child.getAllChildren();
    allChildren = allChildren.concat(grandChildren);
  }

  return allChildren;
};

// Pre-save middleware to update level
categorySchema.pre('save', async function(next) {
  if (this.parent) {
    const parentCategory = await this.constructor.findById(this.parent);
    if (parentCategory) {
      this.level = parentCategory.level + 1;
    }
  } else {
    this.level = 0;
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema); 