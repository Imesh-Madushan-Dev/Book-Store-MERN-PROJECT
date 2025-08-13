const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const { authMiddleware, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .populate('items.bookId', 'title thumbnail author')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get orders for a specific user
// @access  Private (Owner or Admin)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.findByUser(req.params.userId, {
      limit,
      skip: (page - 1) * limit
    });

    const total = await Order.countDocuments({ userId: req.params.userId });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/seller/:sellerId
// @desc    Get orders for a specific seller
// @access  Private (Seller or Admin)
router.get('/seller/:sellerId', authMiddleware, async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.sellerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.findBySeller(req.params.sellerId, {
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit
    });

    // Get total count for pagination
    const totalOrders = await Order.aggregate([
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
          'bookDetails.sellerId': mongoose.Types.ObjectId(req.params.sellerId)
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalOrders[0]?.total || 0;

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private (Owner or Admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate({
        path: 'items.bookId',
        populate: {
          path: 'authorId sellerId',
          select: 'name storeName'
        }
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions (user can view their own orders, admin can view all)
    if (req.user.role !== 'ADMIN' && order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', [
  authMiddleware,
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.bookId').isMongoId().withMessage('Valid book ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('Shipping state is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Shipping ZIP code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Shipping country is required'),
  body('paymentMethod').trim().notEmpty().withMessage('Payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate and process items
    const orderItems = [];
    let subtotal = 0;

    for (const item of req.body.items) {
      const book = await Book.findById(item.bookId);
      
      if (!book || book.status !== 'ACTIVE') {
        return res.status(400).json({ 
          message: `Book ${item.bookId} is not available` 
        });
      }
      
      if (book.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${book.title}. Only ${book.stock} available.` 
        });
      }

      const itemTotal = book.price * item.quantity;
      
      orderItems.push({
        bookId: book._id,
        quantity: item.quantity,
        price: book.price,
        totalPrice: itemTotal
      });
      
      subtotal += itemTotal;
    }

    // Calculate totals
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 50 ? 0 : 5.99; // Free shipping over $50
    const totalAmount = subtotal + tax + shipping;

    // Create order
    const orderData = {
      userId: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      discount: req.body.discount || 0,
      totalAmount: totalAmount - (req.body.discount || 0),
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress || req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      paymentIntentId: req.body.paymentIntentId,
      notes: req.body.notes
    };

    const order = new Order(orderData);
    await order.save();

    // Update book stock and sales
    for (const item of orderItems) {
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { 
          stock: -item.quantity,
          salesCount: item.quantity 
        }
      });
    }

    // Clear user's cart if order is from cart
    if (req.body.clearCart) {
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { items: [] } }
      );
    }

    // Populate order for response
    await order.populate([
      { path: 'userId', select: 'name email' },
      { path: 'items.bookId', select: 'title thumbnail author' }
    ]);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin or Seller)
// @access  Private (Admin/Seller)
router.put('/:id/status', [
  authMiddleware,
  body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Note too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions (admin can update any order, sellers can update orders with their books)
    if (req.user.role !== 'ADMIN') {
      const hasSellerBooks = await Book.findOne({
        _id: { $in: order.items.map(item => item.bookId) },
        sellerId: req.user._id
      });
      
      if (!hasSellerBooks) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await order.updateStatus(req.body.status, req.body.note);

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        status: order.status,
        statusHistory: order.statusHistory
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/tracking
// @desc    Add tracking information (Admin or Seller)
// @access  Private (Admin/Seller)
router.put('/:id/tracking', [
  authMiddleware,
  body('trackingNumber').trim().notEmpty().withMessage('Tracking number is required'),
  body('estimatedDelivery').optional().isISO8601().withMessage('Valid delivery date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (req.user.role !== 'ADMIN') {
      const hasSellerBooks = await Book.findOne({
        _id: { $in: order.items.map(item => item.bookId) },
        sellerId: req.user._id
      });
      
      if (!hasSellerBooks) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const estimatedDelivery = req.body.estimatedDelivery 
      ? new Date(req.body.estimatedDelivery)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    await order.addTracking(req.body.trackingNumber, estimatedDelivery);

    res.json({
      message: 'Tracking information added successfully',
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery
    });
  } catch (error) {
    console.error('Add tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private (Owner or Admin)
router.put('/:id/cancel', [
  authMiddleware,
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long')
], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (req.user.role !== 'ADMIN' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation of pending or confirmed orders
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    // Restore book stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { 
          stock: item.quantity,
          salesCount: -item.quantity 
        }
      });
    }

    await order.cancel(req.body.reason);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/summary', requireAdmin, async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.startDate && req.query.endDate) {
      filters.startDate = req.query.startDate;
      filters.endDate = req.query.endDate;
    }
    
    if (req.query.status) {
      filters.status = req.query.status;
    }

    const stats = await Order.getOrderStats(filters);
    
    // Additional stats
    const [statusBreakdown, recentOrders] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.find({})
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      ...stats,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentOrders
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;