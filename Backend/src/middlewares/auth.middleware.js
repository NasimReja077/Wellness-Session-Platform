import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/User.model.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
     try {

          const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.accessToken
          if (!token) {
               throw new ApiError(401, 'Access token is required')
          }
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
          const user = await User.findById(decodedToken?._id).select('-password')
          
          if (!user) {
               throw new ApiError(401, 'User not found | Invalid access token')
          }
          
          if (!user.isActive) {
               throw new ApiError(401, 'Account is deactivated')
          }
          req.user = user;
          next()
     } catch (error) {
          throw new ApiError(401, error?.message || 'Invalid access token')
     }
})


export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.accessToken

    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decodedToken?._id).select('-password')
      
      if (user && user.isActive) {
        req.user = user
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication for optional auth
    next()
  }
})