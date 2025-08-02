import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log the full error context
  console.error('Error Handler Triggered:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body
  });

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new ApiError(400, `${field} '${value}' already exists`);
  }

  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    error = new ApiError(400, 'Validation Error', errorMessages);
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // If it's not an ApiError, convert it to one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    const stack = err.stack || '';
    error = new ApiError(statusCode, message, [], stack);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};


 // // File upload errors
  // // ✅ Handle Multer (file upload) errors
  // else if (err.code === 'LIMIT_FILE_SIZE') {
  //   error = new ApiError(400, 'File too large');
  // } else if (err.name === 'MulterError') {
  //   error = new ApiError(400, err.message);
  // }