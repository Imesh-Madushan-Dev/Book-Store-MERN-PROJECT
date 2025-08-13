const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'United States' },
  phone: String,
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    index: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['BUYER', 'SELLER', 'ADMIN'], 
    default: 'BUYER',
    index: true
  },
  avatar: String,
  
  // Buyer specific fields
  wishlist: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book' 
  }],
  addresses: [addressSchema],
  
  // Seller specific fields
  storeName: String,
  storeDescription: String,
  verified: { type: Boolean, default: false },
  
  // Profile info
  phone: String,
  dateOfBirth: Date,
  
  // System fields
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  profileComplete: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's orders
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId'
});

// Virtual for seller's books
userSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'sellerId'
});

// Indexes for performance
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

const bcrypt = require('bcryptjs');

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  // Hash password if it's modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Set default address
  if (this.addresses.length > 0 && !this.addresses.some(addr => addr.isDefault)) {
    this.addresses[0].isDefault = true;
  }
  next();
});

// Instance methods
userSchema.methods.addToWishlist = function(bookId) {
  if (!this.wishlist.includes(bookId)) {
    this.wishlist.push(bookId);
  }
  return this.save();
};

userSchema.methods.removeFromWishlist = function(bookId) {
  this.wishlist = this.wishlist.filter(id => id.toString() !== bookId.toString());
  return this.save();
};

userSchema.methods.setDefaultAddress = function(addressId) {
  this.addresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
  return this.save();
};

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findSellers = function() {
  return this.find({ role: 'SELLER', isActive: true });
};

module.exports = mongoose.model('User', userSchema);