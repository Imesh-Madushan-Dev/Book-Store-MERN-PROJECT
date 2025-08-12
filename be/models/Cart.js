const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 10 // Reasonable limit per item
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  sessionId: { 
    type: String,
    index: true
  },
  
  items: [cartItemSchema],
  
  // Auto-calculated fields
  totalItems: { 
    type: Number, 
    default: 0 
  },
  totalPrice: { 
    type: Number, 
    default: 0 
  },
  
  // For guest checkout
  guestEmail: String,
  
  // Expiry for cleanup
  expiresAt: { 
    type: Date, 
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // 30 days
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure either userId or sessionId exists
cartSchema.index({ userId: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Update expiry for active carts
  if (this.items.length > 0) {
    this.expiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
  }
  
  next();
});

// Static methods
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ userId })
    .populate('items.bookId', 'title price thumbnail stock status');
};

cartSchema.statics.findBySession = function(sessionId) {
  return this.findOne({ sessionId })
    .populate('items.bookId', 'title price thumbnail stock status');
};

cartSchema.statics.findOrCreate = async function(userId, sessionId) {
  let cart;
  
  if (userId) {
    // Try to find user cart first
    cart = await this.findByUser(userId);
    
    // If no user cart but there's a session cart, merge them
    if (!cart && sessionId) {
      const sessionCart = await this.findBySession(sessionId);
      if (sessionCart) {
        sessionCart.userId = userId;
        sessionCart.sessionId = undefined;
        cart = await sessionCart.save();
      }
    }
    
    // Create new cart if none exists
    if (!cart) {
      cart = new this({ userId });
      await cart.save();
    }
  } else if (sessionId) {
    cart = await this.findBySession(sessionId);
    if (!cart) {
      cart = new this({ sessionId });
      await cart.save();
    }
  } else {
    throw new Error('Either userId or sessionId is required');
  }
  
  return cart;
};

// Instance methods
cartSchema.methods.addItem = async function(bookId, quantity = 1, price) {
  const existingItem = this.items.find(item => 
    item.bookId.toString() === bookId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
    if (price) existingItem.price = price; // Update price if provided
  } else {
    this.items.push({
      bookId,
      quantity,
      price,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

cartSchema.methods.updateItem = async function(bookId, quantity) {
  const item = this.items.find(item => 
    item.bookId.toString() === bookId.toString()
  );
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    return this.removeItem(bookId);
  }
  
  item.quantity = quantity;
  return this.save();
};

cartSchema.methods.removeItem = async function(bookId) {
  this.items = this.items.filter(item => 
    item.bookId.toString() !== bookId.toString()
  );
  return this.save();
};

cartSchema.methods.clear = async function() {
  this.items = [];
  return this.save();
};

cartSchema.methods.getItemCount = function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
};

cartSchema.methods.getTotal = function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// Merge another cart into this one
cartSchema.methods.merge = async function(otherCart) {
  for (const otherItem of otherCart.items) {
    const existingItem = this.items.find(item => 
      item.bookId.toString() === otherItem.bookId.toString()
    );
    
    if (existingItem) {
      existingItem.quantity += otherItem.quantity;
    } else {
      this.items.push({
        bookId: otherItem.bookId,
        quantity: otherItem.quantity,
        price: otherItem.price,
        addedAt: otherItem.addedAt
      });
    }
  }
  
  return this.save();
};

// Convert to order items format
cartSchema.methods.toOrderItems = function() {
  return this.items.map(item => ({
    bookId: item.bookId,
    quantity: item.quantity,
    price: item.price,
    totalPrice: item.price * item.quantity
  }));
};

// Check if all items are still available and in stock
cartSchema.methods.validateItems = async function() {
  const Book = mongoose.model('Book');
  const issues = [];
  
  for (const item of this.items) {
    const book = await Book.findById(item.bookId);
    
    if (!book || book.status !== 'ACTIVE') {
      issues.push({
        bookId: item.bookId,
        issue: 'Book no longer available'
      });
    } else if (book.stock < item.quantity) {
      issues.push({
        bookId: item.bookId,
        issue: `Only ${book.stock} items in stock, but ${item.quantity} requested`
      });
    } else if (Math.abs(book.price - item.price) > 0.01) {
      issues.push({
        bookId: item.bookId,
        issue: 'Price has changed',
        oldPrice: item.price,
        newPrice: book.price
      });
    }
  }
  
  return issues;
};

module.exports = mongoose.model('Cart', cartSchema);