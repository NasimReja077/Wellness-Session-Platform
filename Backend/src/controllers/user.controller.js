import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Follow/Unfollow user
export const toggleFollow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  console.log('Toggle Follow - id:', id, 'currentUserId:', currentUserId, 'body:', req.body); // Debug log

  if (id === currentUserId.toString()) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  const userToFollow = await User.findById(id);
  if (!userToFollow) {
    throw new ApiError(404, 'User not found');
  }

  const currentUser = await User.findById(currentUserId);
  const isFollowing = currentUser.following.includes(id);

  if (isFollowing) {
    // Unfollow
    currentUser.following.pull(id);
    userToFollow.followers.pull(currentUserId);
  } else {
    // Follow
    currentUser.following.push(id);
    userToFollow.followers.push(currentUserId);
  }

  // Save without validating unchanged fields
  await Promise.all([
    currentUser.save({ validateBeforeSave: false }),
    userToFollow.save({ validateBeforeSave: false })
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length
    }, `User ${isFollowing ? 'unfollowed' : 'followed'} successfully`)
  );
});

// Get followers of a user
export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const followers = await User.find({ _id: { $in: user.followers } })
    .select('username profile.firstName profile.lastName profile.avatar')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = user.followers.length;
  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json(
    new ApiResponse(200, {
      followers,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_followers: total
      }
    }, 'Followers fetched successfully')
  );
});

// Get users a user is following
export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const following = await User.find({ _id: { $in: user.following } })
    .select('username profile.firstName profile.lastName profile.avatar')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = user.following.length;
  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json(
    new ApiResponse(200, {
      following,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_following: total
      }
    }, 'Following fetched successfully')
  );
});