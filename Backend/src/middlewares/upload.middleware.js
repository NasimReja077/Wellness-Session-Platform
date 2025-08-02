import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/temp');
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware for single avatar upload
export const uploadAvatar = upload.single('avatar');

// Middleware for session thumbnail upload
export const uploadThumbnail = upload.single('thumbnail');

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size too large. Maximum size is 5MB'));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ApiError(400, 'Unexpected file field'));
    }
    return next(new ApiError(400, error.message));
  }
  next(error);
};