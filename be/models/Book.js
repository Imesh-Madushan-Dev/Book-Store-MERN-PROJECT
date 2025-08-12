const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  description: { 
    type: String, 
    required: true 
  },
  isbn: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  
  // References
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Author', 
    required: true,
    index: true
  },
  publisherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Publisher', 
    required: true 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true
  },
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Pricing
  price: { 
    type: Number, 
    required: true, 
    min: 0,
    index: true
  },
  originalPrice: { 
    type: Number, 
    min: 0 
  },
  discount: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  
  // Inventory
  stock: { 
    type: Number, 
    required: true, 
    min: 0, 
    default: 0,
    index: true
  },
  
  // Media
  images: [{ 
    type: String, 
    required: true 
  }],
  thumbnail: { 
    type: String, 
    required: true 
  },
  
  // Book details
  format: { 
    type: String, 
    enum: ['HARDCOVER', 'PAPERBACK', 'EBOOK', 'AUDIOBOOK'], 
    required: true,
    index: true
  },
  language: { 
    type: String, 
    required: true, 
    default: 'English',
    index: true
  },
  pages: { 
    type: Number, 
    min: 1 
  },
  publishedYear: { 
    type: Number, 
    required: true,
    index: true
  },
  
  // Metadata
  tags: [{ 
    type: String, 
    lowercase: true,
    index: true
  }],
  
  // Status flags
  featured: { 
    type: Boolean, 
    default: false,
    index: true
  },
  bestseller: { 
    type: Boolean, 
    default: false,
    index: true
  },
  newRelease: { 
    type: Boolean, 
    default: false,
    index: true
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'], 
    default: 'ACTIVE',
    index: true
  },
  
  // Analytics
  viewCount: { 
    type: Number, 
    default: 0 
  },
  salesCount: { 
    type: Number, 
    default: 0 
  },
  
  // SEO
  slug: { 
    type: String, 
    unique: true,
    index: true
  },
  metaTitle: String,
  metaDescription: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rating calculation
bookSchema.virtual('rating').get(function() {
  return this._rating || 0;
});

bookSchema.virtual('reviewCount').get(function() {
  return this._reviewCount || 0;
});

// Virtual populate for reviews
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'bookId'
});

// Compound indexes for common queries
bookSchema.index({ categoryId: 1, status: 1, price: 1 });
bookSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
bookSchema.index({ featured: 1, status: 1, createdAt: -1 });
bookSchema.index({ bestseller: 1, status: 1, createdAt: -1 });
bookSchema.index({ tags: 1, status: 1 });
bookSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware
bookSchema.pre('save', function(next) {
  // Generate slug from title
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Calculate discount
  if (this.originalPrice && this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  
  // Update status based on stock
  if (this.stock === 0 && this.status === 'ACTIVE') {
    this.status = 'OUT_OF_STOCK';
  } else if (this.stock > 0 && this.status === 'OUT_OF_STOCK') {
    this.status = 'ACTIVE';
  }
  
  // Set default thumbnail if not provided
  if (!this.thumbnail && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  
  next();
});

// Instance methods
bookSchema.methods.updateStock = function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    this.stock = Math.max(0, this.stock - quantity);
  } else {
    this.stock += quantity;
  }
  
  if (this.stock === 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.stock > 0 && this.status === 'OUT_OF_STOCK') {
    this.status = 'ACTIVE';
  }
  
  return this.save();
};

bookSchema.methods.incrementSales = function(quantity = 1) {
  this.salesCount += quantity;
  return this.save();
};

bookSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Static methods
bookSchema.statics.findByCategory = function(categoryId, options = {}) {
  const query = { categoryId, status: 'ACTIVE' };
  return this.find(query)
    .populate('authorId', 'name')
    .populate('categoryId', 'name slug')
    .populate('publisherId', 'name')
    .populate('sellerId', 'name storeName')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 0);
};

bookSchema.statics.findBySeller = function(sellerId, options = {}) {
  return this.find({ sellerId })
    .populate('authorId', 'name')
    .populate('categoryId', 'name slug')
    .populate('publisherId', 'name')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 0);
};

bookSchema.statics.searchBooks = function(query, filters = {}) {
  const searchQuery = {
    $and: [
      { status: 'ACTIVE' },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  };
  
  // Apply filters
  if (filters.categoryId) searchQuery.$and.push({ categoryId: filters.categoryId });
  if (filters.authorId) searchQuery.$and.push({ authorId: filters.authorId });
  if (filters.format) searchQuery.$and.push({ format: filters.format });
  if (filters.minPrice) searchQuery.$and.push({ price: { $gte: filters.minPrice } });
  if (filters.maxPrice) searchQuery.$and.push({ price: { $lte: filters.maxPrice } });
  if (filters.inStock) searchQuery.$and.push({ stock: { $gt: 0 } });
  
  return this.find(searchQuery)
    .populate('authorId', 'name')
    .populate('categoryId', 'name slug')
    .populate('publisherId', 'name')
    .populate('sellerId', 'name storeName');
};

module.exports = mongoose.model('Book', bookSchema);