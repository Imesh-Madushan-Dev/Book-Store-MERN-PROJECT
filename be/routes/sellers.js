const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const { authMiddleware, requireRole, requireSeller } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sellers
// @desc    Get all active sellers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'SELLER', isActive: true };
    
    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { storeName: searchRegex },
        { storeDescription: searchRegex }
      ];
    }

    const sellers = await User.find(query)
      .select('name email storeName storeDescription verified avatar createdAt')
      .sort({ verified: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      sellers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sellers/:id
// @desc    Get single seller profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const seller = await User.findOne({ 
      _id: req.params.id, 
      role: 'SELLER', 
      isActive: true 
    })
      .select('name email storeName storeDescription verified avatar createdAt')
      .populate('books', 'title price thumbnail averageRating totalReviews');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get seller's books count
    const booksCount = await Book.countDocuments({ 
      seller: seller._id, 
      status: 'PUBLISHED',
      isActive: true 
    });

    res.json({
      seller: {
        ...seller.toObject(),
        booksCount
      }
    });
  } catch (error) {
    console.error('Get seller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/sellers/profile
// @desc    Update seller profile
// @access  Private (Seller only)
router.put('/profile', [
  authMiddleware,
  requireSeller,
  body('storeName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Store name must be between 2-100 characters'),
  body('storeDescription').optional().trim().isLength({ max: 500 }).withMessage('Store description must be less than 500 characters'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const updates = {};
    const allowedFields = ['name', 'storeName', 'storeDescription', 'phone'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const seller = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Seller profile updated successfully',
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        storeName: seller.storeName,
        storeDescription: seller.storeDescription,
        verified: seller.verified,
        phone: seller.phone,
        updatedAt: seller.updatedAt
      }
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sellers/dashboard/stats
// @desc    Get seller dashboard statistics
// @access  Private (Seller only)
router.get('/dashboard/stats', authMiddleware, requireSeller, async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get books count by status
    const booksStats = await Book.aggregate([
      { $match: { seller: sellerId } },
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get orders statistics
    const ordersStats = await Order.aggregate([
      { $match: { 'items.seller': sellerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get total sales and revenue
    const salesData = await Order.aggregate([
      { $match: { 'items.seller': sellerId, status: 'DELIVERED' } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ 'items.seller': sellerId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber user totalAmount status createdAt');

    const stats = {
      books: booksStats.reduce((acc, stat) => {
        acc[stat._id.toLowerCase()] = stat.count;
        return acc;
      }, { published: 0, draft: 0, archived: 0 }),
      orders: ordersStats.reduce((acc, stat) => {
        acc[stat._id.toLowerCase()] = {
          count: stat.count,
          revenue: stat.totalRevenue
        };
        return acc;
      }, {}),
      sales: salesData[0] || { totalOrders: 0, totalRevenue: 0, totalItems: 0 },
      recentOrders
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sellers/dashboard/orders
// @desc    Get seller orders
// @access  Private (Seller only)
router.get('/dashboard/orders', authMiddleware, requireSeller, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { 'items.seller': req.user._id };
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.book', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/sellers/orders/:orderId/status
// @desc    Update order status
// @access  Private (Seller only)
router.put('/orders/:orderId/status', [
  authMiddleware,
  requireSeller,
  body('status').isIn(['CONFIRMED', 'SHIPPED', 'DELIVERED']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { status } = req.body;
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      'items.seller': req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'SHIPPED' && req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/sellers/account
// @desc    Deactivate seller account
// @access  Private (Seller only)
router.delete('/account', authMiddleware, requireSeller, async (req, res) => {
  try {
    // Soft delete - deactivate account
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    
    // Archive all seller's books
    await Book.updateMany(
      { seller: req.user._id },
      { $set: { status: 'ARCHIVED', isActive: false } }
    );
    
    res.json({ message: 'Seller account deactivated successfully' });
  } catch (error) {
    console.error('Seller account deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;