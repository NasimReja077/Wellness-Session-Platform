import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/User.model.js';
import { Follow } from '../models/Follow.model.js';
import { generateAccessToken } from '../utils/jwt.js';

const generateTokenAndSetCookie = (user, res) => {
  const token = generateAccessToken({
    _id: user._id,
    email: user.email,
    username: user.username,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('accessToken', token, cookieOptions);
  return token;
};

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, profile } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    profile: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      avatar: profile?.avatar || 'https://res.cloudinary.com/wellness-platform/image/upload/v1/default-avatar.jpg',
      fitnessGoals: profile?.fitnessGoals || [],
      dietaryPreferences: profile?.dietaryPreferences || [],
      experienceLevel: profile?.experienceLevel || 'beginner',
      age: profile?.age,
      height: profile?.height,
      weight: profile?.weight,
    },
  });

  const createdUser = await User.findById(user._id)
    .select('-password -refreshToken')
    .populate({
      path: 'followers',
      populate: {
        path: 'follower',
        select: 'username profile.avatar profile.firstName profile.lastName',
      },
    })
    .populate({
      path: 'following',
      populate: {
        path: 'following',
        select: 'username profile.avatar profile.firstName profile.lastName',
      },
    });

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering user');
  }

  // Generate token
  const token = generateTokenAndSetCookie(createdUser, res);

  res.status(201).json(
    new ApiResponse(
      201,
      { user: createdUser, token },
      'User registered successfully'
    )
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account is deactivated');
  }

  // Check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  // Generate token
  const token = generateTokenAndSetCookie(user, res);

  const loggedInUser = await User.findById(user._id)
    .select('-password -refreshToken')
    .populate({
      path: 'followers',
      populate: {
        path: 'follower',
        select: 'username profile.avatar profile.firstName profile.lastName',
      },
    })
    .populate({
      path: 'following',
      populate: {
        path: 'following',
        select: 'username profile.avatar profile.firstName profile.lastName',
      },
    });

  res.status(200).json(
    new ApiResponse(
      200,
      { user: loggedInUser, token },
      'User logged in successfully'
    )
  );
});

export const logoutUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken')
    .populate({
      path: 'followers',
      populate: {
        path: 'follower',
        select: 'username profile.avatar profile.firstName profile.lastName',
      },
    })
    .populate({
      path: 'following',
      populate: {
        path: 'following',
        select: 'username profile.avatar profile.firstName profile.lastName',
      },
    });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if current user is following themselves (should be false)
  let isFollowing = false;
  if (req.user) {
    const followRecord = await Follow.findOne({
      follower: req.user._id,
      following: req.user._id,
    });
    isFollowing = !!followRecord;
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { user, isFollowing },
      'Current user fetched successfully'
    )
  );
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    bio,
    location,
    fitnessGoals,
    dietaryPreferences,
    experienceLevel,
    age,
    height,
    weight,
    avatar,
  } = req.body;

  const updateData = {
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
    'profile.avatar': avatar,
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .select('-password -refreshToken')
    .populate({
      path: 'followers',
      populate: {
        path: 'follower',
        select: 'username profile.avatar profile.firstName profile.lastName',
      },
    })
    .populate({
      path: 'following',
      populate: {
        path: 'following',
        select: 'username profile.avatar profile.firstName profile.lastName',
      },
    });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, user, 'Profile updated successfully')
  );
});