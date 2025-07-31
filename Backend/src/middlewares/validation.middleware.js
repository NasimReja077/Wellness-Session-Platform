import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }))
    
    throw new ApiError(400, 'Validation failed', errorMessages)
  }
  
  next();
}