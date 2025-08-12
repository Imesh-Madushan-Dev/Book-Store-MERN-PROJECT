const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Book = require('../models/Book');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError, processUploadedFiles } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('bookCount')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Calculate actual book counts
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const bookCount = await Book.countDocuments({
          categoryId: category._id,
          status: 'ACTIVE'
        });
        return { ...category, bookCount };
      })
    );

    res.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/hierarchy
// @desc    Get categories in hierarchical structure
// @access  Public
router.get('/hierarchy', async (req, res) => {
  try {
    const topLevelCategories = await Category.find({ 
      parentId: null, 
      isActive: true 
    })
    .populate({
      path: 'children',
      match: { isActive: true },
      options: { sort: { sortOrder: 1, name: 1 } }
    })
    .sort({ sortOrder: 1, name: 1 });

    res.json({ categories: topLevelCategories });
  } catch (error) {
    console.error('Get category hierarchy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent')
      .populate('children');

    if (!category || !category.isActive) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get book count
    const bookCount = await Book.countDocuments({
      categoryId: category._id,
      status: 'ACTIVE'
    });

    // Get category path
    const fullPath = await category.getFullPath();

    res.json({
      category: {
        ...category.toObject(),
        bookCount,
        fullPath
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Category not found' });
    }
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/slug/:slug
// @desc    Get category by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findBySlug(req.params.slug);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get book count
    const bookCount = await Book.countDocuments({
      categoryId: category._id,
      status: 'ACTIVE'
    });

    // Get recent books in this category
    const recentBooks = await Book.find({
      categoryId: category._id,
      status: 'ACTIVE'
    })
    .populate('authorId', 'name')
    .populate('sellerId', 'name storeName')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

    res.json({
      category: {
        ...category.toObject(),
        bookCount,
        recentBooks
      }
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category (Admin only)
// @access  Private (Admin)
router.post('/', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles,
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('parentId').optional().isMongoId().withMessage('Invalid parent category ID'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify parent category exists if provided
    if (req.body.parentId) {
      const parentCategory = await Category.findById(req.body.parentId);
      if (!parentCategory || !parentCategory.isActive) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const categoryData = {
      name: req.body.name,
      description: req.body.description,
      parentId: req.body.parentId || null,
      sortOrder: req.body.sortOrder || 0,
      color: req.body.color || '#6366f1',
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription
    };

    // Add image if uploaded
    if (req.uploadedFile) {
      categoryData.image = req.uploadedFile.url;
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.name) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
      if (error.keyPattern.slug) {
        return res.status(400).json({ message: 'Category slug already exists' });
      }
    }
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category (Admin only)
// @access  Private (Admin)
router.put('/:id', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles,
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('parentId').optional().isMongoId().withMessage('Invalid parent category ID'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Prevent setting parent to self or creating circular references
    if (req.body.parentId && req.body.parentId === req.params.id) {
      return res.status(400).json({ message: 'Category cannot be its own parent' });
    }

    // Verify parent category exists if provided
    if (req.body.parentId) {
      const parentCategory = await Category.findById(req.body.parentId);
      if (!parentCategory || !parentCategory.isActive) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const updates = {};
    const allowedFields = ['name', 'description', 'parentId', 'sortOrder', 'color', 'metaTitle', 'metaDescription', 'isActive'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Add image if uploaded
    if (req.uploadedFile) {
      updates.image = req.uploadedFile.url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.name) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
      if (error.keyPattern.slug) {
        return res.status(400).json({ message: 'Category slug already exists' });
      }
    }
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category (Admin only)
// @access  Private (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has books
    const bookCount = await Book.countDocuments({
      categoryId: req.params.id,
      status: 'ACTIVE'
    });

    if (bookCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${bookCount} active books. Move books to another category first.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({
      parentId: req.params.id,
      isActive: true
    });

    if (subcategoryCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${subcategoryCount} subcategories. Delete or move subcategories first.`
      });
    }

    // Soft delete - set isActive to false
    category.isActive = false;
    await category.save();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id/books
// @desc    Get books in a category
// @access  Public
router.get('/:id/books', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const books = await Book.find({
      categoryId: req.params.id,
      status: 'ACTIVE'
    })
    .populate('authorId', 'name')
    .populate('sellerId', 'name storeName')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Book.countDocuments({
      categoryId: req.params.id,
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

// @route   GET /api/categories/:id/stats
// @desc    Get category statistics (Admin only)
// @access  Private (Admin)
router.get('/:id/stats', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const [bookCount, totalSales, avgPrice] = await Promise.all([
      Book.countDocuments({ categoryId: req.params.id, status: 'ACTIVE' }),
      Book.aggregate([
        { $match: { categoryId: mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: null, totalSales: { $sum: '$salesCount' } } }
      ]),
      Book.aggregate([
        { $match: { categoryId: mongoose.Types.ObjectId(req.params.id), status: 'ACTIVE' } },
        { $group: { _id: null, avgPrice: { $avg: '$price' } } }
      ])
    ]);

    res.json({
      category: category.name,
      stats: {
        bookCount,
        totalSales: totalSales[0]?.totalSales || 0,
        averagePrice: avgPrice[0]?.avgPrice || 0,
        subcategories: await Category.countDocuments({ 
          parentId: req.params.id, 
          isActive: true 
        })
      }
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;