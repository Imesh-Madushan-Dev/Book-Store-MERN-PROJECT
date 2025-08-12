const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const { authMiddleware, requireOwnerOrAdmin, requireAdmin } = require('../middleware/auth');
const { uploadUserAvatar, handleUploadError, processUploadedFiles } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', [requireAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { storeName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Owner or Admin)
router.get('/:id', [authMiddleware], async (req, res) => {
  try {
    // Check if user can access this profile
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id)
      .populate('wishlist', 'title price thumbnail')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add user stats for sellers
    let stats = {};
    if (user.role === 'SELLER') {
      const [bookCount, orderStats] = await Promise.all([
        Book.countDocuments({ sellerId: user._id, status: 'ACTIVE' }),
        Order.aggregate([
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
              'bookDetails.sellerId': user._id,
              status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
            }
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' }
            }
          }
        ])
      ]);

      stats = {
        bookCount,
        totalOrders: orderStats[0]?.totalOrders || 0,
        totalRevenue: orderStats[0]?.totalRevenue || 0
      };
    }

    res.json({
      user: {
        ...user.toObject(),
        stats
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Owner or Admin)
router.put('/:id', [
  authMiddleware,
  uploadUserAvatar,
  handleUploadError,
  processUploadedFiles,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('role').optional().isIn(['BUYER', 'SELLER', 'ADMIN']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check permissions
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only admins can change roles
    if (req.body.role && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can change user roles' });
    }

    const updates = {};
    const allowedFields = ['name', 'phone', 'dateOfBirth', 'storeName', 'storeDescription'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Add avatar if uploaded
    if (req.uploadedFile) {
      updates.avatar = req.uploadedFile.url;
    }

    // Admin can update role and verification status
    if (req.user.role === 'ADMIN') {
      if (req.body.role) updates.role = req.body.role;
      if (req.body.verified !== undefined) updates.verified = req.body.verified;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/addresses
// @desc    Add address to user
// @access  Private (Owner)
router.post('/:id/addresses', [
  authMiddleware,
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('street').trim().isLength({ min: 1 }).withMessage('Street address is required'),
  body('city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('state').trim().isLength({ min: 1 }).withMessage('State is required'),
  body('zipCode').trim().isLength({ min: 1 }).withMessage('ZIP code is required'),
  body('country').trim().isLength({ min: 1 }).withMessage('Country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user can add address to this profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAddress = {
      name: req.body.name,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
      phone: req.body.phone,
      isDefault: req.body.isDefault || user.addresses.length === 0
    };

    // If this is set as default, make others non-default
    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: 'Address added successfully',
      address: user.addresses[user.addresses.length - 1]
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/addresses/:addressId
// @desc    Update address
// @access  Private (Owner)
router.put('/:id/addresses/:addressId', [
  authMiddleware,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('street').optional().trim().isLength({ min: 1 }).withMessage('Street address cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Update address fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        address[key] = req.body[key];
      }
    });

    // Handle default address change
    if (req.body.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === req.params.addressId;
      });
    }

    await user.save();

    res.json({
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id/addresses/:addressId
// @desc    Delete address
// @access  Private (Owner)
router.delete('/:id/addresses/:addressId', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.addressId);

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/wishlist/:bookId
// @desc    Add book to wishlist
// @access  Private (Owner)
router.post('/:id/wishlist/:bookId', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await user.addToWishlist(req.params.bookId);

    res.json({ message: 'Book added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id/wishlist/:bookId
// @desc    Remove book from wishlist
// @access  Private (Owner)
router.delete('/:id/wishlist/:bookId', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.removeFromWishlist(req.params.bookId);

    res.json({ message: 'Book removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/wishlist
// @desc    Get user wishlist
// @access  Private (Owner)
router.get('/:id/wishlist', authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id)
      .populate({
        path: 'wishlist',
        populate: [
          { path: 'authorId', select: 'name' },
          { path: 'categoryId', select: 'name slug' },
          { path: 'sellerId', select: 'name storeName' }
        ]
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ wishlist: user.wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/sellers
// @desc    Get all sellers
// @access  Public
router.get('/sellers/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { role: 'SELLER', isActive: true };
    if (req.query.verified === 'true') {
      filter.verified = true;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { storeName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [sellers, total] = await Promise.all([
      User.find(filter)
        .select('name storeName storeDescription avatar verified createdAt')
        .sort({ verified: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Add book count for each seller
    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const bookCount = await Book.countDocuments({
          sellerId: seller._id,
          status: 'ACTIVE'
        });
        return { ...seller, bookCount };
      })
    );

    res.json({
      sellers: sellersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;