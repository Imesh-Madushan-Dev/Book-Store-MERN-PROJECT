const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Public (works with session or user ID)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.query.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    let cart;
    if (userId) {
      cart = await Cart.findByUser(userId);
    } else {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      cart = await Cart.findOrCreate(userId, sessionId);
    }

    // Validate cart items (check availability, stock, prices)
    const issues = await cart.validateItems();
    
    res.json({
      cart,
      issues: issues.length > 0 ? issues : undefined
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart/items
// @desc    Add item to cart
// @access  Public
router.post('/items', [
  optionalAuth,
  body('bookId').isMongoId().withMessage('Valid book ID required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  body('sessionId').optional().isLength({ min: 1 }).withMessage('Session ID cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?._id;
    const sessionId = req.body.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    // Check if book exists and is available
    const book = await Book.findById(req.body.bookId);
    if (!book || book.status !== 'ACTIVE') {
      return res.status(404).json({ message: 'Book not found or unavailable' });
    }

    if (book.stock < req.body.quantity) {
      return res.status(400).json({ 
        message: `Only ${book.stock} items available in stock`,
        availableStock: book.stock
      });
    }

    // Get or create cart
    const cart = await Cart.findOrCreate(userId, sessionId);

    // Add item to cart
    await cart.addItem(req.body.bookId, req.body.quantity, book.price);

    // Refresh cart with populated data
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.bookId',
        select: 'title price thumbnail stock status',
        populate: {
          path: 'authorId',
          select: 'name'
        }
      });

    res.json({
      message: 'Item added to cart',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cart/items/:bookId
// @desc    Update cart item quantity
// @access  Public
router.put('/items/:bookId', [
  optionalAuth,
  body('quantity').isInt({ min: 0, max: 10 }).withMessage('Quantity must be between 0 and 10'),
  body('sessionId').optional().isLength({ min: 1 }).withMessage('Session ID cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?._id;
    const sessionId = req.body.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findByUser(userId);
    } else {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Check stock if increasing quantity
    if (req.body.quantity > 0) {
      const book = await Book.findById(req.params.bookId);
      if (!book || book.status !== 'ACTIVE') {
        return res.status(404).json({ message: 'Book not found or unavailable' });
      }

      if (book.stock < req.body.quantity) {
        return res.status(400).json({ 
          message: `Only ${book.stock} items available in stock`,
          availableStock: book.stock
        });
      }
    }

    // Update item quantity (or remove if quantity is 0)
    await cart.updateItem(req.params.bookId, req.body.quantity);

    // Refresh cart with populated data
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.bookId',
        select: 'title price thumbnail stock status',
        populate: {
          path: 'authorId',
          select: 'name'
        }
      });

    res.json({
      message: req.body.quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart/items/:bookId
// @desc    Remove item from cart
// @access  Public
router.delete('/items/:bookId', [
  optionalAuth,
  body('sessionId').optional().isLength({ min: 1 }).withMessage('Session ID cannot be empty')
], async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.body.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findByUser(userId);
    } else {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.removeItem(req.params.bookId);

    // Refresh cart with populated data
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.bookId',
        select: 'title price thumbnail stock status',
        populate: {
          path: 'authorId',
          select: 'name'
        }
      });

    res.json({
      message: 'Item removed from cart',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Public
router.delete('/', [
  optionalAuth,
  body('sessionId').optional().isLength({ min: 1 }).withMessage('Session ID cannot be empty')
], async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.body.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findByUser(userId);
    } else {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.clear();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart/merge
// @desc    Merge session cart with user cart on login
// @access  Private
router.post('/merge', [
  optionalAuth,
  body('sessionId').isLength({ min: 1 }).withMessage('Session ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const sessionCart = await Cart.findBySession(req.body.sessionId);
    if (!sessionCart || sessionCart.items.length === 0) {
      return res.json({ message: 'No session cart to merge' });
    }

    // Get or create user cart
    let userCart = await Cart.findByUser(req.user._id);
    if (!userCart) {
      // Convert session cart to user cart
      sessionCart.userId = req.user._id;
      sessionCart.sessionId = undefined;
      await sessionCart.save();
      userCart = sessionCart;
    } else {
      // Merge session cart into user cart
      await userCart.merge(sessionCart);
      
      // Remove session cart
      await Cart.findByIdAndDelete(sessionCart._id);
    }

    // Refresh cart with populated data
    const updatedCart = await Cart.findById(userCart._id)
      .populate({
        path: 'items.bookId',
        select: 'title price thumbnail stock status',
        populate: {
          path: 'authorId',
          select: 'name'
        }
      });

    res.json({
      message: 'Cart merged successfully',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cart/validate
// @desc    Validate cart items (check availability, prices, stock)
// @access  Public
router.get('/validate', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.query.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findByUser(userId);
    } else {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const issues = await cart.validateItems();
    
    res.json({
      valid: issues.length === 0,
      issues,
      cart: {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice
      }
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cart/summary
// @desc    Get cart summary (totals, taxes, shipping)
// @access  Public
router.get('/summary', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.query.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findByUser(userId);
    } else {
      cart = await Cart.findBySession(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const subtotal = cart.totalPrice;
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 50 ? 0 : 5.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    res.json({
      summary: {
        subtotal,
        tax,
        shipping,
        total,
        itemCount: cart.totalItems,
        freeShippingEligible: subtotal >= 50,
        freeShippingThreshold: 50
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;