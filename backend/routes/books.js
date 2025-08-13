const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Book = require('../models/Book');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { authMiddleware, optionalAuth, requireSeller, requireAdmin } = require('../middleware/auth');
const { uploadBookImages, handleUploadError, processUploadedFiles } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/books
// @desc    Get books with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['title', 'price', 'rating', 'createdAt', 'salesCount']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Build filter query
    const filter = { status: 'ACTIVE' };
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.category) {
      filter.categoryId = req.query.category;
    }
    
    if (req.query.author) {
      filter.authorId = req.query.author;
    }
    
    if (req.query.publisher) {
      filter.publisherId = req.query.publisher;
    }
    
    if (req.query.format) {
      filter.format = req.query.format;
    }
    
    if (req.query.language) {
      filter.language = req.query.language;
    }
    
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    
    if (req.query.bestseller === 'true') {
      filter.bestseller = true;
    }
    
    if (req.query.newRelease === 'true') {
      filter.newRelease = true;
    }
    
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    if (req.query.rating) {
      filter._rating = { $gte: parseInt(req.query.rating) };
    }

    // Execute query
    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate('authorId', 'name slug')
        .populate('categoryId', 'name slug')
        .populate('publisherId', 'name')
        .populate('sellerId', 'name storeName')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Book.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext,
        hasPrev
      },
      filters: req.query
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('authorId', 'name bio slug')
      .populate('categoryId', 'name slug')
      .populate('publisherId', 'name description')
      .populate('sellerId', 'name storeName verified');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Increment view count (but not for the seller viewing their own book)
    if (!req.user || req.user._id.toString() !== book.sellerId._id.toString()) {
      book.incrementViews();
    }

    // Get reviews for this book
    const reviews = await Review.findByBook(book._id, { limit: 10 });
    
    // Get related books (same category, different book)
    const relatedBooks = await Book.find({
      categoryId: book.categoryId,
      _id: { $ne: book._id },
      status: 'ACTIVE'
    })
    .populate('authorId', 'name')
    .populate('sellerId', 'name storeName')
    .limit(6)
    .lean();

    res.json({
      book: {
        ...book.toObject(),
        reviews,
        relatedBooks
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Book not found' });
    }
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/books
// @desc    Create a new book (Sellers only)
// @access  Private (Seller)
router.post('/', [
  requireSeller,
  uploadBookImages,
  handleUploadError,
  processUploadedFiles,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('isbn').isISBN().withMessage('Valid ISBN is required'),
  body('authorId').isMongoId().withMessage('Valid author ID is required'),
  body('publisherId').isMongoId().withMessage('Valid publisher ID is required'),
  body('categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('format').isIn(['HARDCOVER', 'PAPERBACK', 'EBOOK', 'AUDIOBOOK']).withMessage('Invalid format'),
  body('language').optional().isLength({ min: 1 }).withMessage('Language is required'),
  body('pages').optional().isInt({ min: 1 }).withMessage('Pages must be a positive integer'),
  body('publishedYear').isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Valid published year required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify related entities exist
    const [author, publisher, category] = await Promise.all([
      Author.findById(req.body.authorId),
      Publisher.findById(req.body.publisherId),
      Category.findById(req.body.categoryId)
    ]);

    if (!author) return res.status(400).json({ message: 'Author not found' });
    if (!publisher) return res.status(400).json({ message: 'Publisher not found' });
    if (!category) return res.status(400).json({ message: 'Category not found' });

    // Process uploaded images
    const images = [];
    let thumbnail = '';

    if (req.uploadedFiles?.thumbnail?.[0]) {
      thumbnail = req.uploadedFiles.thumbnail[0].url;
    }

    if (req.uploadedFiles?.images) {
      images.push(...req.uploadedFiles.images.map(file => file.url));
    }

    // If no thumbnail but has images, use first image as thumbnail
    if (!thumbnail && images.length > 0) {
      thumbnail = images[0];
    }

    if (!thumbnail) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const bookData = {
      ...req.body,
      sellerId: req.user._id,
      images: images.length > 0 ? images : [thumbnail],
      thumbnail,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    };

    const book = new Book(bookData);
    await book.save();

    // Populate related fields for response
    await book.populate([
      { path: 'authorId', select: 'name' },
      { path: 'publisherId', select: 'name' },
      { path: 'categoryId', select: 'name slug' },
      { path: 'sellerId', select: 'name storeName' }
    ]);

    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }
    console.error('Create book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book (Owner or Admin only)
// @access  Private (Seller/Admin)
router.put('/:id', [
  authMiddleware,
  uploadBookImages,
  handleUploadError,
  processUploadedFiles,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check ownership (seller can only update their own books, admin can update any)
    if (req.user.role !== 'ADMIN' && book.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    // Process image updates
    const updates = { ...req.body };
    
    if (req.uploadedFiles?.thumbnail?.[0]) {
      updates.thumbnail = req.uploadedFiles.thumbnail[0].url;
    }

    if (req.uploadedFiles?.images) {
      updates.images = req.uploadedFiles.images.map(file => file.url);
    }

    if (req.body.tags) {
      updates.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate([
      { path: 'authorId', select: 'name' },
      { path: 'publisherId', select: 'name' },
      { path: 'categoryId', select: 'name slug' },
      { path: 'sellerId', select: 'name storeName' }
    ]);

    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book (Owner or Admin only)
// @access  Private (Seller/Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check ownership
    if (req.user.role !== 'ADMIN' && book.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    // Soft delete - set status to INACTIVE
    book.status = 'INACTIVE';
    await book.save();

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/seller/:sellerId
// @desc    Get books by seller
// @access  Public
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const books = await Book.findBySeller(req.params.sellerId, {
      sort: { createdAt: -1 },
      limit: limit,
      skip: skip
    });

    const total = await Book.countDocuments({
      sellerId: req.params.sellerId,
      status: 'ACTIVE'
    });

    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get seller books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/category/:categoryId
// @desc    Get books by category
// @access  Public
router.get('/category/:categoryId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const books = await Book.findByCategory(req.params.categoryId, {
      sort: { createdAt: -1 },
      limit: limit,
      skip: skip
    });

    const total = await Book.countDocuments({
      categoryId: req.params.categoryId,
      status: 'ACTIVE'
    });

    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get category books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/books/:id/stock
// @desc    Update book stock (Seller only)
// @access  Private (Seller/Admin)
router.post('/:id/stock', [
  authMiddleware,
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('operation').isIn(['increase', 'decrease']).withMessage('Operation must be increase or decrease')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check ownership
    if (req.user.role !== 'ADMIN' && book.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    await book.updateStock(req.body.quantity, req.body.operation);

    res.json({
      message: 'Stock updated successfully',
      stock: book.stock,
      status: book.status
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;