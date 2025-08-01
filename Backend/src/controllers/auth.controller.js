import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/User.model.js';
import { generateAccessToken} from '../utils/jwt.js';

const generateTokenAndSetCookie = (user, res) => {
  const token = generateAccessToken({
    _id: user._id,
    email: user.email,
    username: user.username
  })

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }

  res.cookie('accessToken', token, cookieOptions)
  return token
}

export const registerUser = asyncHandler(async (req, res) => {
     const { username, email, password, profile } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (existingUser) {
    throw new ApiError(409, 'User with email or username already exists')
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: password,
    profile: profile || {}
  });

  const createdUser = await User.findById(user._id).select('-password')

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering user')
  }

  // Generate token
  const token = generateTokenAndSetCookie(createdUser, res)

  res.status(201).json(
    new ApiResponse(201, {
      user: createdUser,
      token
    }, 'User registered successfully')
  )

})

// Login user
export const loginUser = asyncHandler(async (req, res) => {
     const { email, password } = req.body

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User does not exist')
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account is deactivated')
  }

  // Check password
  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials')
  }

  // Generate token
  const token = generateTokenAndSetCookie(user, res)

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  res.status(200).json(
    new ApiResponse(200, {
      user: loggedInUser,
      token
    }, 'User logged in successfully')
  )
})


// Logout user
export const logoutUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
})


// Get current user profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('followers', 'username email profile.avatar')
    .populate('following', 'username email profile.avatar')

  res.status(200).json(
    new ApiResponse(200, user, 'User fetched successfully')
  )
})


// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
     const { firstName, lastName, bio, location, fitnessGoals, dietaryPreferences, experienceLevel, age, height, weight } = req.body;
     
     const user = await User.findByIdAndUpdate(
          req.user._id,
          {
               $set: {
                    'profile.firstName': firstName,
                    'profile.lastName': lastName,
                    'profile.bio': bio,
                    'profile.location': location,
                    'profile.fitnessGoals': fitnessGoals,
                    'profile.dietaryPreferences': dietaryPreferences,
                    'profile.experienceLevel': experienceLevel,
                    'profile.age': age,
                    'profile.height': height,
                    'profile.weight': weight,
                    // 'profile.avatar': avatarUrl
               }},{ new: true }
          ).select('-password')
          res.status(200).json(
               new ApiResponse(200, user, 'Profile updated successfully')
          )
     })