const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  totalPrice: { 
    type: Number, 
    required: true, 
    min: 0 
  }
});

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Order items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  tax: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  shipping: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  discount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], 
    default: 'PENDING',
    index: true
  },
  
  // Payment
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], 
    default: 'PENDING',
    index: true
  },
  paymentMethod: String,
  paymentIntentId: String, // For Stripe integration
  
  // Addresses
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String
  },
  
  billingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  
  // Shipping
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Additional info
  notes: String,
  cancellationReason: String,
  
  // Status history
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ 'items.bookId': 1 });

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for unique sellers
orderSchema.virtual('sellers').get(function() {
  // This would require populating book data to get sellerId
  return [];
});

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Add status change to history
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  
  // Calculate totals
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.totalAmount = this.subtotal + this.tax + this.shipping - this.discount;
  }
  
  next();
});

// Post-save middleware to update book sales
orderSchema.post('save', async function(doc) {
  if (doc.status === 'CONFIRMED' && doc.isModified('status')) {
    const Book = mongoose.model('Book');
    
    // Update book sales count and reduce stock
    for (const item of doc.items) {
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { 
          salesCount: item.quantity,
          stock: -item.quantity
        }
      });
    }
  }
});

// Static methods
orderSchema.statics.findByUser = function(userId, options = {}) {
  return this.find({ userId })
    .populate('items.bookId', 'title thumbnail author')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 0);
};

orderSchema.statics.findBySeller = async function(sellerId, options = {}) {
  // This requires aggregation to filter by seller through books
  const orders = await this.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'items.bookId',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    {
      $match: {
        'bookDetails.sellerId': mongoose.Types.ObjectId(sellerId)
      }
    },
    {
      $sort: options.sort || { createdAt: -1 }
    }
  ]);
  
  return orders;
};

orderSchema.statics.getOrderStats = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.startDate && filters.endDate) {
    matchStage.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  if (filters.status) {
    matchStage.status = filters.status;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        totalItems: { $sum: { $sum: '$items.quantity' } }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalItems: 0
  };
};

// Instance methods
orderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note
  });
  return this.save();
};

orderSchema.methods.addTracking = function(trackingNumber, estimatedDelivery) {
  this.trackingNumber = trackingNumber;
  this.estimatedDelivery = estimatedDelivery;
  this.status = 'SHIPPED';
  return this.save();
};

orderSchema.methods.cancel = function(reason) {
  this.status = 'CANCELLED';
  this.cancellationReason = reason;
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);