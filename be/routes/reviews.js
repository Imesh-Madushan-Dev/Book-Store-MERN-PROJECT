const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews (Admin only)
// @access  Private (Admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    
    if (req.query.bookId) {
      filter.bookId = req.query.bookId;
    }
    
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }
    
    if (req.query.verified === 'true') {
      filter.verified = true;
    }
    
    if (req.query.flagged === 'true') {
      filter.flagged = true;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('bookId', 'title thumbnail')
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter)
    ]);

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/book/:bookId
// @desc    Get reviews for a specific book
// @access  Public
router.get('/book/:bookId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate book exists
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const sortOptions = {};
    
    if (req.query.sort === 'helpful') {
      sortOptions.helpful = -1;
    } else if (req.query.sort === 'rating') {
      sortOptions.rating = req.query.order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // Default: newest first
    }

    const filter = { bookId: req.params.bookId, isActive: true };
    
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }
    
    if (req.query.verified === 'true') {
      filter.verified = true;
    }

    const [reviews, total, stats] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
      Review.getBookStats(req.params.bookId)
    ]);

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.findByUser(req.params.userId, {
      limit,
      skip: (page - 1) * limit
    });

    const total = await Review.countDocuments({
      userId: req.params.userId,
      isActive: true
    });

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', [
  authMiddleware,
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('comment').trim().isLength({ min: 10, max: 2000 }).withMessage('Comment must be 10-2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if book exists
    const book = await Book.findById(req.body.bookId);
    if (!book || book.status !== 'ACTIVE') {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      bookId: req.body.bookId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Check if user has purchased this book (for verification)
    const hasPurchased = await Order.findOne({
      userId: req.user._id,
      'items.bookId': req.body.bookId,
      status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
    });

    const reviewData = {
      bookId: req.body.bookId,
      userId: req.user._id,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      verified: !!hasPurchased
    };

    const review = new Review(reviewData);
    await review.save();

    // Populate user data for response
    await review.populate('userId', 'name avatar');

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review (Owner only)
// @access  Private
router.put('/:id', [
  authMiddleware,
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('comment').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Comment must be 10-2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership (user can only update their own reviews, admin can update any)
    if (req.user.role !== 'ADMIN' && review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const updates = {};
    if (req.body.rating !== undefined) updates.rating = req.body.rating;
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.comment !== undefined) updates.comment = req.body.comment;

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'name avatar');

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (Owner or Admin only)
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (req.user.role !== 'ADMIN' && review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Soft delete - set isActive to false
    review.isActive = false;
    await review.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review || !review.isActive) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // In a production app, you'd want to track who marked it helpful to prevent duplicates
    // For now, we'll just increment the counter
    await review.markHelpful(req.user._id);

    res.json({
      message: 'Review marked as helpful',
      helpful: review.helpful
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/not-helpful
// @desc    Mark review as not helpful
// @access  Private
router.post('/:id/not-helpful', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review || !review.isActive) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.markNotHelpful(req.user._id);

    res.json({
      message: 'Review marked as not helpful',
      notHelpful: review.notHelpful
    });
  } catch (error) {
    console.error('Mark not helpful error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:id/flag
// @desc    Flag review for moderation (Admin only)
// @access  Private (Admin)
router.post('/:id/flag', [
  requireAdmin,
  body('reason').trim().isLength({ min: 1 }).withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.flag(req.body.reason, req.user._id);

    res.json({ message: 'Review flagged successfully' });
  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get single review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('bookId', 'title thumbnail')
      .populate('userId', 'name avatar');

    if (!review || !review.isActive) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Review not found' });
    }
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;