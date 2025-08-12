const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true,
    index: true
  },
  description: String,
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true,
    index: true
  },
  image: String,
  
  // Hierarchy support
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    default: null,
    index: true
  },
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // Display order
  sortOrder: { 
    type: Number, 
    default: 0 
  },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Colors for UI
  color: { 
    type: String, 
    default: '#6366f1' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for book count
categorySchema.virtual('bookCount', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'categoryId',
  count: true
});

// Virtual for subcategories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Virtual for parent category
categorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true
});

// Indexes
categorySchema.index({ parentId: 1, isActive: 1, sortOrder: 1 });
categorySchema.index({ slug: 1, isActive: 1 });

// Pre-save middleware
categorySchema.pre('save', function(next) {
  // Generate slug from name
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Static methods
categorySchema.statics.findWithBooks = function() {
  return this.find({ isActive: true })
    .populate('bookCount')
    .sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findTopLevel = function() {
  return this.find({ parentId: null, isActive: true })
    .populate('children')
    .sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true })
    .populate('parent')
    .populate('children');
};

// Instance methods
categorySchema.methods.getFullPath = async function() {
  let path = [this.name];
  let current = this;
  
  while (current.parentId) {
    current = await this.constructor.findById(current.parentId);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

module.exports = mongoose.model('Category', categorySchema);