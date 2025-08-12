const express = require('express');
const { body, validationResult } = require('express-validator');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');
const { requireAdmin } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError, processUploadedFiles } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/publishers
// @desc    Get all publishers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const [publishers, total] = await Promise.all([
      Publisher.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Publisher.countDocuments(filter)
    ]);

    // Add actual book counts
    const publishersWithCounts = await Promise.all(
      publishers.map(async (publisher) => {
        const bookCount = await Book.countDocuments({
          publisherId: publisher._id,
          status: 'ACTIVE'
        });
        return { ...publisher, bookCount };
      })
    );

    res.json({
      publishers: publishersWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get publishers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/publishers/:id
// @desc    Get single publisher by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.id);

    if (!publisher || !publisher.isActive) {
      return res.status(404).json({ message: 'Publisher not found' });
    }

    // Get publisher's books
    const books = await Book.find({
      publisherId: publisher._id,
      status: 'ACTIVE'
    })
    .populate('authorId', 'name slug')
    .populate('categoryId', 'name slug')
    .populate('sellerId', 'name storeName')
    .sort({ createdAt: -1 })
    .lean();

    // Calculate stats
    const stats = {
      bookCount: books.length,
      totalSales: books.reduce((sum, book) => sum + (book.salesCount || 0), 0),
      authors: [...new Set(books.map(book => book.authorId.name))],
      categories: [...new Set(books.map(book => book.categoryId.name))]
    };

    res.json({
      publisher: {
        ...publisher.toObject(),
        books,
        stats
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Publisher not found' });
    }
    console.error('Get publisher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/publishers/slug/:slug
// @desc    Get publisher by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const publisher = await Publisher.findBySlug(req.params.slug);

    if (!publisher) {
      return res.status(404).json({ message: 'Publisher not found' });
    }

    // Get publisher's books
    const books = await Book.find({
      publisherId: publisher._id,
      status: 'ACTIVE'
    })
    .populate('authorId', 'name slug')
    .populate('categoryId', 'name slug')
    .populate('sellerId', 'name storeName')
    .sort({ createdAt: -1 })
    .lean();

    res.json({
      publisher: {
        ...publisher.toObject(),
        books
      }
    });
  } catch (error) {
    console.error('Get publisher by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/publishers
// @desc    Create a new publisher (Admin only)
// @access  Private (Admin)
router.post('/', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles,
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('website').optional().isURL().withMessage('Valid website URL required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const publisherData = {
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      phone: req.body.phone,
      website: req.body.website,
      address: req.body.address
    };

    // Add logo if uploaded
    if (req.uploadedFile) {
      publisherData.logo = req.uploadedFile.url;
    }

    const publisher = new Publisher(publisherData);
    await publisher.save();

    res.status(201).json({
      message: 'Publisher created successfully',
      publisher
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Publisher with this name already exists' });
    }
    console.error('Create publisher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/publishers/:id
// @desc    Update a publisher (Admin only)
// @access  Private (Admin)
router.put('/:id', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('website').optional().isURL().withMessage('Valid website URL required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return res.status(404).json({ message: 'Publisher not found' });
    }

    const updates = {};
    const allowedFields = ['name', 'description', 'email', 'phone', 'website', 'address', 'isActive'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Add logo if uploaded
    if (req.uploadedFile) {
      updates.logo = req.uploadedFile.url;
    }

    const updatedPublisher = await Publisher.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Publisher updated successfully',
      publisher: updatedPublisher
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Publisher with this name already exists' });
    }
    console.error('Update publisher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/publishers/:id
// @desc    Delete a publisher (Admin only)
// @access  Private (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return res.status(404).json({ message: 'Publisher not found' });
    }

    // Check if publisher has books
    const bookCount = await Book.countDocuments({
      publisherId: req.params.id,
      status: 'ACTIVE'
    });

    if (bookCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete publisher with ${bookCount} active books. Remove or reassign books first.`
      });
    }

    // Soft delete - set isActive to false
    publisher.isActive = false;
    await publisher.save();

    res.json({ message: 'Publisher deleted successfully' });
  } catch (error) {
    console.error('Delete publisher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/publishers/:id/books
// @desc    Get books by publisher
// @access  Public
router.get('/:id/books', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const books = await Book.find({
      publisherId: req.params.id,
      status: 'ACTIVE'
    })
    .populate('authorId', 'name slug')
    .populate('categoryId', 'name slug')
    .populate('sellerId', 'name storeName')
    .sort({ publishedYear: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Book.countDocuments({
      publisherId: req.params.id,
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
    console.error('Get publisher books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;