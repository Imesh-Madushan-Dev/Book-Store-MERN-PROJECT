const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true,
    index: true
  },
  description: String,
  website: String,
  logo: String,
  
  // Contact info
  email: String,
  phone: String,
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Stats
  bookCount: { 
    type: Number, 
    default: 0 
  },
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // SEO
  slug: { 
    type: String, 
    unique: true,
    index: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for books
publisherSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'publisherId'
});

// Indexes
publisherSchema.index({ name: 'text' });

// Pre-save middleware
publisherSchema.pre('save', function(next) {
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
publisherSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

// Instance methods
publisherSchema.methods.updateBookCount = async function() {
  const Book = mongoose.model('Book');
  this.bookCount = await Book.countDocuments({ 
    publisherId: this._id, 
    status: 'ACTIVE' 
  });
  return this.save();
};

module.exports = mongoose.model('Publisher', publisherSchema);