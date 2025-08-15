const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type or route
    let folder = 'bookstore';
    
    if (req.route?.path?.includes('books')) {
      folder = 'bookstore/books';
    } else if (req.route?.path?.includes('users')) {
      folder = 'bookstore/users';
    } else if (req.route?.path?.includes('authors')) {
      folder = 'bookstore/authors';
    } else if (req.route?.path?.includes('publishers')) {
      folder = 'bookstore/publishers';
    } else if (req.route?.path?.includes('categories')) {
      folder = 'bookstore/categories';
    }
    
    return {
      folder: folder,
      upload_preset: 'products',
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      resource_type: 'auto',
      // Transformation for book covers and thumbnails
      transformation: file.fieldname === 'thumbnail' ? [
        { width: 400, height: 600, crop: 'fit', quality: 'auto' }
      ] : [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
      ]
    };
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Different upload configurations
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

// Book images upload (thumbnail + gallery images)
const uploadBookImages = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

// User avatar upload
const uploadUserAvatar = upload.single('avatar');

// Category/Author/Publisher image upload
const uploadSingleImage = upload.single('image');

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 10 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      message: 'Only image files are allowed (JPEG, PNG, GIF, WebP).'
    });
  }
  
  next(error);
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Extract public ID from Cloudinary URL
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]{3,4}$/);
  return matches ? matches[1] : null;
};

// Middleware to process uploaded files and add URLs to request
const processUploadedFiles = (req, res, next) => {
  if (req.file) {
    // Single file upload
    req.uploadedFile = {
      url: req.file.path,
      publicId: req.file.filename,
      size: req.file.size,
      format: req.file.format
    };
  }
  
  if (req.files) {
    // Handle array of files with same field name (for upload.array())
    if (Array.isArray(req.files)) {
      req.uploadedFiles = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        size: file.size,
        format: file.format
      }));
    } else {
      // Handle multiple files with different field names (for upload.fields())
      req.uploadedFiles = {};
      Object.keys(req.files).forEach(fieldName => {
        const files = req.files[fieldName];
        req.uploadedFiles[fieldName] = files.map(file => ({
          url: file.path,
          publicId: file.filename,
          size: file.size,
          format: file.format
        }));
      });
    }
  }
  
  next();
};

// Cleanup middleware to delete uploaded files if request fails
const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    // If response has error status and files were uploaded, clean them up
    if (res.statusCode >= 400) {
      const cleanup = async () => {
        try {
          if (req.uploadedFile?.publicId) {
            await deleteImage(req.uploadedFile.publicId);
          }
          
          if (req.uploadedFiles) {
            if (Array.isArray(req.uploadedFiles)) {
              for (const file of req.uploadedFiles) {
                if (file.publicId) {
                  await deleteImage(file.publicId);
                }
              }
            } else {
              for (const fieldName of Object.keys(req.uploadedFiles)) {
                for (const file of req.uploadedFiles[fieldName]) {
                  if (file.publicId) {
                    await deleteImage(file.publicId);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error cleaning up uploaded files:', error);
        }
      };
      
      cleanup();
    }
    
    originalSend.call(this, body);
  };
  
  next();
};

module.exports = {
  cloudinary,
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadBookImages,
  uploadUserAvatar,
  uploadSingleImage,
  handleUploadError,
  deleteImage,
  extractPublicId,
  processUploadedFiles,
  cleanupOnError
};