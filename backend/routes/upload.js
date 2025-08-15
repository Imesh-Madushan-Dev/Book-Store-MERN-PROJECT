const express = require('express');
const { body } = require('express-validator');
const { 
  uploadSingle, 
  uploadMultiple, 
  uploadBookImages,
  uploadUserAvatar,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles,
  deleteImage,
  extractPublicId
} = require('../middleware/upload');
const { authMiddleware, requireSeller, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/upload/single
// @desc    Upload single image
// @access  Private
router.post('/single', [
  authMiddleware,
  uploadSingle('image'),
  handleUploadError,
  processUploadedFiles
], async (req, res) => {
  try {
    if (!req.uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      file: req.uploadedFile
    });
  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private
router.post('/multiple', [
  authMiddleware,
  uploadMultiple('images', 5),
  handleUploadError,
  processUploadedFiles
], async (req, res) => {
  try {
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    res.json({
      message: 'Images uploaded successfully',
      files: req.uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/book
// @desc    Upload book images (thumbnail + gallery)
// @access  Private (Seller)
router.post('/book', [
  authMiddleware,
  requireSeller,
  uploadMultiple('images', 10),
  handleUploadError,
  processUploadedFiles
], async (req, res) => {
  try {
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Extract URLs from uploaded files to match frontend expectations
    const urls = req.uploadedFiles.map(file => file.url);

    res.json({
      message: 'Book images uploaded successfully',
      urls: urls,
      files: req.uploadedFiles
    });
  } catch (error) {
    console.error('Book upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', [
  authMiddleware,
  uploadUserAvatar,
  handleUploadError,
  processUploadedFiles
], async (req, res) => {
  try {
    if (!req.uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: req.uploadedFile
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/category
// @desc    Upload category image
// @access  Private (Admin)
router.post('/category', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles
], async (req, res) => {
  try {
    if (!req.uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Category image uploaded successfully',
      image: req.uploadedFile
    });
  } catch (error) {
    console.error('Category upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/author
// @desc    Upload author image
// @access  Private (Admin)
router.post('/author', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles
], async (req, res) => {
  try {
    if (!req.uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Author image uploaded successfully',
      image: req.uploadedFile
    });
  } catch (error) {
    console.error('Author upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/publisher
// @desc    Upload publisher logo
// @access  Private (Admin)
router.post('/publisher', [
  requireAdmin,
  uploadSingleImage,
  handleUploadError,
  processUploadedFiles
], async (req, res) => {
  try {
    if (!req.uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Publisher logo uploaded successfully',
      logo: req.uploadedFile
    });
  } catch (error) {
    console.error('Publisher upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   DELETE /api/upload/:publicId
// @desc    Delete image by public ID
// @access  Private
router.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const result = await deleteImage(req.params.publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found or already deleted' });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// @route   POST /api/upload/delete-by-url
// @desc    Delete image by URL
// @access  Private
router.post('/delete-by-url', [
  authMiddleware,
  body('url').isURL().withMessage('Valid URL required')
], async (req, res) => {
  try {
    const publicId = extractPublicId(req.body.url);
    
    if (!publicId) {
      return res.status(400).json({ message: 'Invalid Cloudinary URL' });
    }

    const result = await deleteImage(publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found or already deleted' });
    }
  } catch (error) {
    console.error('Delete image by URL error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// @route   GET /api/upload/info
// @desc    Get upload configuration info
// @access  Public
router.get('/info', (req, res) => {
  res.json({
    limits: {
      fileSize: '5MB',
      maxFiles: 10
    },
    acceptedTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ],
    endpoints: {
      single: '/api/upload/single',
      multiple: '/api/upload/multiple',
      book: '/api/upload/book',
      avatar: '/api/upload/avatar',
      category: '/api/upload/category',
      author: '/api/upload/author',
      publisher: '/api/upload/publisher'
    }
  });
});

module.exports = router;