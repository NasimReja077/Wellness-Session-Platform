import { User } from '../models/User.model.js';
import { Follow } from '../models/Follow.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

export const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  const user = await User.findById(id)
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

  // Check if current user is following this user
  let isFollowing = false;
  if (req.user) {
    const followRecord = await Follow.findOne({
      follower: req.user._id,
      following: id,
    });
    isFollowing = !!followRecord;
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { user, isFollowing },
      'User profile fetched successfully'
    )
  );
});

export const toggleFollow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  if (id === currentUserId.toString()) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  const userToFollow = await User.findById(id);
  if (!userToFollow) {
    throw new ApiError(404, 'User not found');
  }

  const existingFollow = await Follow.findOne({
    follower: currentUserId,
    following: id,
  });

  let followersCount;
  if (existingFollow) {
    // Unfollow
    await Follow.deleteOne({ _id: existingFollow._id });
    followersCount = await Follow.countDocuments({ following: id });
  } else {
    // Follow
    await Follow.create({ follower: currentUserId, following: id });
    followersCount = await Follow.countDocuments({ following: id });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isFollowing: !existingFollow,
        followersCount,
      },
      `User ${existingFollow ? 'unfollowed' : 'followed'} successfully`
    )
  );
});

export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const followers = await Follow.find({ following: userId })
    .populate('follower', 'username profile.firstName profile.lastName profile.avatar')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Follow.countDocuments({ following: userId });
  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        followers: followers.map((f) => f.follower),
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_followers: total,
        },
      },
      'Followers fetched successfully'
    )
  );
});

export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const following = await Follow.find({ follower: userId })
    .populate('following', 'username profile.firstName profile.lastName profile.avatar')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Follow.countDocuments({ follower: userId });
  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        following: following.map((f) => f.following),
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_following: total,
        },
      },
      'Following fetched successfully'
    )
  );
});