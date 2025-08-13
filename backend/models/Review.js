const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true,
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Review content
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    index: true
  },
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  comment: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  
  // Interaction metrics
  helpful: { 
    type: Number, 
    default: 0 
  },
  notHelpful: { 
    type: Number, 
    default: 0 
  },
  
  // Verification
  verified: { 
    type: Boolean, 
    default: false,
    index: true
  },
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // Moderation
  flagged: { 
    type: Boolean, 
    default: false 
  },
  flaggedReason: String,
  moderatedAt: Date,
  moderatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true }); // One review per user per book
reviewSchema.index({ bookId: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ rating: 1, isActive: 1 });

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpful + this.notHelpful;
  return total > 0 ? (this.helpful / total) : 0;
});

// Post-save middleware to update book rating
reviewSchema.post('save', async function(doc) {
  await updateBookRating(doc.bookId);
});

reviewSchema.post('remove', async function(doc) {
  await updateBookRating(doc.bookId);
});

// Helper function to update book rating
async function updateBookRating(bookId) {
  const Review = mongoose.model('Review');
  const Book = mongoose.model('Book');
  
  const stats = await Review.aggregate([
    { $match: { bookId: bookId, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  const rating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
  const reviewCount = stats.length > 0 ? stats[0].totalReviews : 0;
  
  await Book.findByIdAndUpdate(bookId, {
    _rating: rating,
    _reviewCount: reviewCount
  });
}

// Static methods
reviewSchema.statics.findByBook = function(bookId, options = {}) {
  const query = { bookId, isActive: true };
  
  return this.find(query)
    .populate('userId', 'name avatar')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 0)
    .skip(options.skip || 0);
};

reviewSchema.statics.findByUser = function(userId, options = {}) {
  return this.find({ userId, isActive: true })
    .populate('bookId', 'title thumbnail')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 0);
};

reviewSchema.statics.getBookStats = async function(bookId) {
  const stats = await this.aggregate([
    { $match: { bookId: mongoose.Types.ObjectId(bookId), isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const result = stats[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  result.ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });
  
  return {
    averageRating: Math.round(result.averageRating * 10) / 10,
    totalReviews: result.totalReviews,
    ratingDistribution: distribution
  };
};

// Instance methods
reviewSchema.methods.markHelpful = function(userId) {
  // In a real app, you'd track who marked it helpful to prevent duplicates
  this.helpful += 1;
  return this.save();
};

reviewSchema.methods.markNotHelpful = function(userId) {
  this.notHelpful += 1;
  return this.save();
};

reviewSchema.methods.flag = function(reason, moderatorId) {
  this.flagged = true;
  this.flaggedReason = reason;
  this.moderatedAt = new Date();
  this.moderatedBy = moderatorId;
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);