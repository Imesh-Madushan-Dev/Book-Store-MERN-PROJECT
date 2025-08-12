const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  bio: String,
  image: String,
  nationality: String,
  birthYear: Number,
  deathYear: Number,
  
  // Social links
  website: String,
  twitter: String,
  instagram: String,
  
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
  },
  metaDescription: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for books
authorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'authorId'
});

// Virtual for age
authorSchema.virtual('age').get(function() {
  if (!this.birthYear) return null;
  const currentYear = new Date().getFullYear();
  const endYear = this.deathYear || currentYear;
  return endYear - this.birthYear;
});

// Indexes
authorSchema.index({ name: 'text' });
authorSchema.index({ nationality: 1, isActive: 1 });

// Pre-save middleware
authorSchema.pre('save', function(next) {
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
authorSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

authorSchema.statics.searchAuthors = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      { name: { $regex: query, $options: 'i' } }
    ]
  }).sort({ name: 1 });
};

// Instance methods
authorSchema.methods.updateBookCount = async function() {
  const Book = mongoose.model('Book');
  this.bookCount = await Book.countDocuments({ 
    authorId: this._id, 
    status: 'ACTIVE' 
  });
  return this.save();
};

module.exports = mongoose.model('Author', authorSchema);