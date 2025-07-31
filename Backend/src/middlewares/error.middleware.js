import { ApiError } from "../utils/ApiError";

export const errorHandler = (err, req, res, next) => {
  let error = err

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }))
    error = new ApiError(400, 'Validation Error', errorMessages)
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]
    error = new ApiError(400, `${field} '${value}' already exists`)
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`)
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token')
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired')
  }

  // If it's not an ApiError, convert it to one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal Server Error'
    error = new ApiError(statusCode, message)
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error)
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}