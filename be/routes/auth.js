const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').isIn(['BUYER', 'SELLER']).withMessage('Role must be BUYER or SELLER'),
  body('storeName').optional().trim().isLength({ min: 2 }).withMessage('Store name must be at least 2 characters when provided'),
  body('storeDescription').optional().isLength({ max: 500 }).withMessage('Store description must be less than 500 characters')
], async (req, res) => {
  try {
    console.log('📝 Registration request received:', {
      email: req.body.email,
      name: req.body.name,
      role: req.body.role,
      storeName: req.body.storeName,
      storeDescriptionLength: req.body.storeDescription?.length || 0
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password, name, role, storeName, storeDescription } = req.body;

    // Additional validation for seller role
    if (role === 'SELLER' && (!storeName || storeName.trim().length < 2)) {
      console.log('❌ Store name required for seller role');
      return res.status(400).json({ 
        message: 'Store name is required for sellers and must be at least 2 characters',
        errors: [{ field: 'storeName', msg: 'Store name is required for sellers' }]
      });
    }

    // Check if user already exists
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      return res.status(400).json({ 
        message: 'User already exists with this email'
      });
    }

    // Create new user
    console.log('🆕 Creating new user...');
    const userData = {
      email: email.toLowerCase(),
      password,
      name,
      role,
      profileComplete: true
    };

    // Add seller-specific fields
    if (role === 'SELLER') {
      userData.storeName = storeName || '';
      userData.storeDescription = storeDescription || '';
      userData.verified = false;
    }

    console.log('💾 User data to save:', {
      ...userData,
      password: '[HIDDEN]'
    });

    const user = new User(userData);
    await user.save();

    console.log('✅ New user created successfully:', user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        profileComplete: user.profileComplete,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('🔑 Login request received for:', req.body.email);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      console.log('❌ User account deactivated:', email);
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User authenticated successfully:', user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        verified: user.verified,
        profileComplete: user.profileComplete,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'title price thumbnail')
      .select('-password -__v');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        verified: user.verified,
        wishlist: user.wishlist,
        addresses: user.addresses,
        profileComplete: user.profileComplete,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authMiddleware,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date required'),
  body('storeName').optional().trim().isLength({ min: 2 }).withMessage('Store name must be at least 2 characters'),
  body('storeDescription').optional().trim().isLength({ max: 500 }).withMessage('Store description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const allowedFields = ['name', 'phone', 'dateOfBirth', 'storeName', 'storeDescription'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Ensure seller-specific fields are only updated by sellers
    if ((updates.storeName || updates.storeDescription) && req.user.role !== 'SELLER') {
      return res.status(403).json({ message: 'Only sellers can update store information' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        profileComplete: user.profileComplete,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  authMiddleware,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authMiddleware, (req, res) => {
  // In JWT authentication, logout is typically handled on the client side
  // by removing the token from storage. This endpoint mainly exists for consistency
  res.json({ message: 'Logged out successfully' });
});

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    // Soft delete - deactivate account
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    
    // In production, you might also want to:
    // 1. Cancel active orders
    // 2. Remove from wishlists
    // 3. Clean up related data
    
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;