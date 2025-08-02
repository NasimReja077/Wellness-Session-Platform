import { Session } from '../models/Session.model.js';
import { Like } from '../models/Like.model.js';
import { SessionTracking } from '../models/SessionTracking.model.js';
import { Comment } from '../models/Comment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';


// Helper function for pagination
const getPagination = (page, limit) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum };
};

// Get all public sessions with filtering and pagination
export const getPublicSessions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    difficulty,
    sort = 'newest',
    tags,
    search,
//     sortBy = 'createdAt',
//     sortOrder = 'desc',
    minDuration,
    maxDuration
  } = req.query

  const { skip, limit: limitNum } = getPagination(page, limit);
  // Build filter query
  const filter = { status: 'published', privacy: 'public' };

  if (category) {
    filter.category = category
  }

  if (difficulty) {
    filter.difficulty = difficulty
  }

  if (minDuration || maxDuration) {
      filter.duration = {};
      if (minDuration) filter.duration.$gte = parseInt(minDuration);
      if (maxDuration) filter.duration.$lte = parseInt(maxDuration);
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  let sortOption = {};
  switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { 'engagement.views_count': -1, 'engagement.likes_count': -1 };
        break;
      case 'duration':
        sortOption = { duration: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const sessions = await Session.find(filter)
    .populate('createdBy', 'username profile.avatar profile.firstName profile.lastName')
    .populate('category_details', 'name')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  const total = await Session.countDocuments(filter);

  // Add user interaction data if authenticated
    if (req.user) {
      const sessionIds = sessions.map(s => s._id);
      const userLikes = await Like.find({
        user: req.user.id,
        sessions: { $in: sessionIds }
      }).distinct('session');

      const userProgress = await SessionTracking.find({
        user: req.user.id,
        session: { $in: sessionIds }
      }).select('session completed_at');

      sessions.forEach(session => {
        session.isLiked = userLikes.some(likeId => likeId.equals(session._id));
        session.userProgress = userProgress.find(p => p.session.equals(session._id));
      });
    }

  res.status(200).json(
    new ApiResponse(200, {
      sessions,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_sessions: total,
        has_next: skip + sessions.length < total,
        has_prev: parseInt(page) > 1
      }
    }, 'Sessions fetched successfully')
  );
});


// Get single session by ID
export const getSessionById = asyncHandler(async (req, res) => {
     const { id } = req.params;
     
     const session = await Session.findById(id)
     .populate('createdBy', 'username profile.firstName profile.lastName profile.avatar profile.bio')
     .populate('category_details', 'name');

     if (!session) {
          throw new ApiError(404, 'Session not found')
     }
     
     // Check if session is accessible
     if (session.status === 'draft' && session.createdBy._id.toString() !== req.user?._id?.toString()) {
          throw new ApiError(403, 'Access denied');
     }

     if (session.privacy === 'private' && session.createdBy._id.toString() !== req.user?._id?.toString()) {
          throw new ApiError(403, 'Access denied');
     }
     
     // Increment view count if not the owner
     if (req.user && session.createdBy._id.toString() !== req.user._id.toString() && session.status === 'published') {
          await Session.incrementViews(req.user._id);
      }

    // Add user interaction data if authenticated
    let isLiked = false;
    let userProgress = null;

    if (req.user) {
    const like = await Like.findOne({
      user: req.user._id,
      session: session._id
    });
    isLiked = !!like;

    userProgress = await SessionTracking.findOne({
      user: req.user._id,
      session: session._id
    }).sort({ completed_at: -1 });
  }

    const sessionData = session.toObject();
    sessionData.isLiked = isLiked;
    sessionData.userProgress = userProgress;
    
    
    res.status(200).json(
          new ApiResponse(200, session, 'Session fetched successfully')
     );
});


// Get user's own sessions
export const getUserSessions = asyncHandler(async (req, res) => {
     const { page = 1, limit = 12, status, category } = req.query;
     const { skip, limit: limitNum } = getPagination(page, limit);
     const filter = { createdBy: req.user._id };

  if (status) {
    filter.status = status
  }

  if (category) {
    filter.category = category
  }
  
  const sessions = await Session.find(filter)
     .populate('createdBy', 'username profile.avatar profile.firstName profile.lastName')
     .populate('category_details', 'name')
     .sort({ updatedAt: -1 })
     .skip(skip)
     .limit(limitNum);;

  const total = await Session.countDocuments(filter)

  res.status(200).json(
    new ApiResponse(200, {
      sessions,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_sessions: total,
        has_next: skip + sessions.length < total,
        has_prev: parseInt(page) > 1
      }
    }, 'User sessions fetched successfully')
  );
});

// Create or update draft session
export const saveDraftSession = asyncHandler(async (req, res) => {
  const { sessionId, title, description, category, tags, difficulty, duration, json_file_url, content, privacy } = req.body;

//   // Handle thumbnail upload
//   let thumbnailUrl = req.file ? (await uploadOnCloudinary(req.file.path))?.secure_url : undefined;
//   if (req.file && !thumbnailUrl) {
//     throw new ApiError(500, 'Failed to upload thumbnail');
//   }

  let session;
  if (sessionId) {
    // Update existing draft session
    const updateData = {
      title,
      description,
      category,
      tags,
      difficulty,
      duration,
      json_file_url,
      'content.instructions': content?.instructions,
      'content.equipment': content?.equipment,
      'content.calories_burned': content?.calories_burned,
      'content.nutritional_info': content?.nutritional_info,
      'content.equipment_needed': content?.equipment_needed,
      'content.target_muscles': content?.target_muscles,
      privacy,
      // thumbnail: thumbnailUrl,
      updatedAt: Date.now()
    };
    // Remove undefined fields for partial updates
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    session = await Session.findOneAndUpdate(
      { _id: sessionId, createdBy: req.user._id, status: 'draft' },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!session) {
      throw new ApiError(404, 'Draft session not found or access denied');
    }
  } else {
    // Create new draft session
    session = await Session.create({
      createdBy: req.user._id,
      title,
      description,
      category,
      tags: tags || [],
      difficulty,
      duration,
      json_file_url,
      content: content || {
        instructions: [],
        equipment: [],
        calories_burned: 0,
        nutritional_info: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
        equipment_needed: [],
        target_muscles: []
      },
      status: 'draft',
      privacy: privacy || 'public',
      // thumbnail: thumbnailUrl || 'https://res.cloudinary.com/wellness-platform/image/upload/v1/default-session.jpg'
    });
  }

  res.status(200).json(
    new ApiResponse(200, session, 'Draft saved successfully')
  );
});


// Publish session
export const publishSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  // Step 1: Find the session by ID
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Step 2: Check ownership
  if (session.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied');
  }

  // Step 3: Check if already published
  if (session.status === 'published') {
    return res.status(200).json(
      new ApiResponse(200, session, 'Session already published')
    );
  }

  // Step 4: Update to publish
  session.status = 'published';
  session.isPublished = true;
  session.published_at = new Date();

  await session.save();

  const populatedSession = await Session.findById(sessionId)
    .populate('createdBy', 'username profile.firstName profile.lastName profile.avatar profile.bio');

  res.status(200).json(
    new ApiResponse(200, populatedSession, 'Session published successfully')
  );
});


// Update session
export const updateSession = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  const session = await Session.findOne({ _id: id, createdBy: req.user._id })

  if (!session) {
    throw new ApiError(404, 'Session not found or access denied')
  }

  Object.assign(session, updateData)
  await session.save()

  res.status(200).json(
    new ApiResponse(200, session, 'Session updated successfully')
  )
})


// Delete session
export const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params

  const session = await Session.findOne({ _id: id, createdBy: req.user._id })

  if (!session) {
    throw new ApiError(404, 'Session not found or access denied')
  }

   // Clean up related data
    await Promise.all([
      Like.deleteMany({ session: session._id }),
      Comment.deleteMany({ session: session._id }),
      SessionTracking.deleteMany({ session: session._id })
    ]);

  await Session.findByIdAndDelete(id)

  res.status(200).json(
    new ApiResponse(200, {}, 'Session deleted successfully')
  )
})


// Like/Unlike session
export const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params

  const session = await Session.findById(id)

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  const userId = req.user._id
  const isLiked = session.engagement.likes.includes(userId);

  if (isLiked) {
    session.engagement.likes.pull(userId);
    session.engagement.likes_count -= 1;
  } else {
    session.engagement.likes.push(userId)
    session.engagement.likes_count += 1;
  }
  await session.save();

  res.status(200).json(
    new ApiResponse(200, {
      isLiked: !isLiked,
      likesCount: session.engagement.likes.length
    }, `Session ${isLiked ? 'unliked' : 'liked'} successfully`)
  );
});




// Add comment to session
export const addComment = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { content, parentCommentId } = req.body;

  // Check if session exists
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // If it's a reply, check if parent comment exists
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment || parentComment.session.toString() !== sessionId) {
      throw new ApiError(404, 'Parent comment not found');
    }
  }

  // Create new comment
  const comment = await Comment.create({
    session: sessionId,
    user: req.user._id,
    content,
    parent_comment: parentCommentId || null // Fixed field name
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'username profile.firstName profile.lastName profile.avatar')
    .populate('replies', 'content user');

  // Update session comment count
  await Session.findByIdAndUpdate(sessionId, { $inc: { 'engagement.comments_count': 1 } });

  res.status(201).json(
    new ApiResponse(201, populatedComment, 'Comment added successfully')
  );
});


// Get comments for a session
export const getComments = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { page = 1, limit = 12 } = req.query;

  // Check if session exists
  const session = await Session.findById(sessionId)
  if (!session) {
    throw new ApiError(404, 'Session not found')
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  // go top-level
  const comments = await Comment.find({
    session: sessionId,
    parent_comment: null // Only top-level comments
  })
  .populate('user', 'username profile.firstName profile.lastName profile.avatar')
  .populate({
    path: 'replies',
    populate: {
      path: 'user',
      select: 'username profile.firstName profile.lastName profile.avatar'
    },
    options: { sort: { createdAt: -1 }, limit: 5} // add limit
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(parseInt(limit))

  const total = await Comment.countDocuments({
    session: sessionId,
    parent_comment: null
  });

  res.status(200).json(
    new ApiResponse(200, {
      comments,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_comments: total
      }
    }, 'Comments fetched successfully')
  );
});