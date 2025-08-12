const express = require('express');
const { body, validationResult } = require('express-validator');
const Author = require('../models/Author');
const Book = require('../models/Book');
const { requireAdmin } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError, processUploadedFiles } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/authors
// @desc    Get all authors
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
    
    if (req.query.nationality) {
      filter.nationality = req.query.nationality;
    }

    const [authors, total] = await Promise.all([
      Author.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Author.countDocuments(filter)
    ]);

    // Add actual book counts
    const authorsWithCounts = await Promise.all(
      authors.map(async (author) => {
        const bookCount = await Book.countDocuments({
          authorId: author._id,
          status: 'ACTIVE'
        });
        return { ...author, bookCount };
      })
    );

    res.json({
      authors: authorsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get authors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/authors/:id
// @desc    Get single author by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author || !author.isActive) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Get author's books
    const books = await Book.find({
      authorId: author._id,
      status: 'ACTIVE'
    })
    .populate('categoryId', 'name slug')
    .populate('sellerId', 'name storeName')
    .sort({ createdAt: -1 })
    .lean();

    // Calculate stats
    const stats = {
      bookCount: books.length,
      totalSales: books.reduce((sum, book) => sum + (book.salesCount || 0), 0),
      averageRating: books.length > 0 
        ? books.reduce((sum, book) => sum + (book._rating || 0), 0) / books.length 
        : 0,
      categories: [...new Set(books.map(book => book.categoryId.name))]
    };

    res.json({
      author: {
        ...author.toObject(),
        books,
        stats
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Author not found' });
    }
    console.error('Get author error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/authors/slug/:slug
// @desc    Get author by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const author = await Author.findBySlug(req.params.slug);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Get author's books
    const books = await Book.find({
      authorId: author._id,
      status: 'ACTIVE'
    })
    .populate('categoryId', 'name slug')
    .populate('sellerId', 'name storeName')
    .sort({ createdAt: -1 })
    .lean();

    res.json({
      author: {
        ...author.toObject(),
        books
      }
    });
  } catch (error) {
    console.error('Get author by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/authors
// @desc    Create a new author (Admin only)
// @access  Private (Admin)
router.post('/', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles,
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio too long'),
  body('nationality').optional().trim().isLength({ min: 1 }).withMessage('Nationality cannot be empty'),
  body('birthYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid birth year'),
  body('deathYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid death year'),
  body('website').optional().isURL().withMessage('Invalid website URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate birth/death year logic
    if (req.body.birthYear && req.body.deathYear && req.body.birthYear >= req.body.deathYear) {
      return res.status(400).json({ message: 'Death year must be after birth year' });
    }

    const authorData = {
      name: req.body.name,
      bio: req.body.bio,
      nationality: req.body.nationality,
      birthYear: req.body.birthYear,
      deathYear: req.body.deathYear,
      website: req.body.website,
      twitter: req.body.twitter,
      instagram: req.body.instagram,
      metaDescription: req.body.metaDescription
    };

    // Add image if uploaded
    if (req.uploadedFile) {
      authorData.image = req.uploadedFile.url;
    }

    const author = new Author(authorData);
    await author.save();

    res.status(201).json({
      message: 'Author created successfully',
      author
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Author with this name already exists' });
    }
    console.error('Create author error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/authors/:id
// @desc    Update an author (Admin only)
// @access  Private (Admin)
router.put('/:id', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio too long'),
  body('birthYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid birth year'),
  body('deathYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid death year'),
  body('website').optional().isURL().withMessage('Invalid website URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Validate birth/death year logic
    const birthYear = req.body.birthYear || author.birthYear;
    const deathYear = req.body.deathYear || author.deathYear;
    
    if (birthYear && deathYear && birthYear >= deathYear) {
      return res.status(400).json({ message: 'Death year must be after birth year' });
    }

    const updates = {};
    const allowedFields = ['name', 'bio', 'nationality', 'birthYear', 'deathYear', 'website', 'twitter', 'instagram', 'metaDescription', 'isActive'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Add image if uploaded
    if (req.uploadedFile) {
      updates.image = req.uploadedFile.url;
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Author updated successfully',
      author: updatedAuthor
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Author with this name already exists' });
    }
    console.error('Update author error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/authors/:id
// @desc    Delete an author (Admin only)
// @access  Private (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Check if author has books
    const bookCount = await Book.countDocuments({
      authorId: req.params.id,
      status: 'ACTIVE'
    });

    if (bookCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete author with ${bookCount} active books. Remove or reassign books first.`
      });
    }

    // Soft delete - set isActive to false
    author.isActive = false;
    await author.save();

    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Delete author error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/authors/:id/books
// @desc    Get books by author
// @access  Public
router.get('/:id/books', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const books = await Book.find({
      authorId: req.params.id,
      status: 'ACTIVE'
    })
    .populate('categoryId', 'name slug')
    .populate('sellerId', 'name storeName')
    .sort({ publishedYear: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Book.countDocuments({
      authorId: req.params.id,
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
    console.error('Get author books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/authors/search/:query
// @desc    Search authors
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const authors = await Author.searchAuthors(req.params.query);
    
    // Add book counts
    const authorsWithCounts = await Promise.all(
      authors.map(async (author) => {
        const bookCount = await Book.countDocuments({
          authorId: author._id,
          status: 'ACTIVE'
        });
        return { ...author.toObject(), bookCount };
      })
    );

    res.json({ authors: authorsWithCounts });
  } catch (error) {
    console.error('Search authors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;