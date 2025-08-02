import { SessionTracking } from '../models/SessionTracking.model.js';
import { User } from '../models/User.model.js';
import { Session } from '../models/Session.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get user dashboard analytics
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get current user stats
  const user = await User.findById(userId).select('stats');

  // Get recent session completions
  const recentCompletions = await SessionTracking.find({ user: userId }) // Changed from user_id
    .populate('session', 'title category duration')
    .sort({ completed_at: -1 })
    .limit(10);

  // Get this week's activity
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const weeklyActivity = await SessionTracking.aggregate([
    {
      $match: {
        user: userId, // Changed from user_id
        completed_at: { $gte: weekStart }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$completed_at" }
        },
        sessions: { $sum: 1 },
        minutes: { $sum: "$duration_completed" },
        calories: { $sum: "$calories_burned" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get category breakdown
  const categoryStats = await SessionTracking.aggregate([
    {
      $match: { user: userId } // Changed from user_id
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'session', // Changed from session_id
        foreignField: '_id',
        as: 'session'
      }
    },
    { $unwind: '$session' },
    {
      $group: {
        _id: '$session.category',
        count: { $sum: 1 },
        totalMinutes: { $sum: '$duration_completed' },
        totalCalories: { $sum: '$calories_burned' }
      }
    }
  ]);

  // Calculate streak
  const streak = await calculateStreak(userId);

  res.status(200).json(
    new ApiResponse(200, {
      user_stats: user.stats,
      recent_completions: recentCompletions,
      weekly_activity: weeklyActivity,
      category_stats: categoryStats,
      current_streak: streak
    }, 'Dashboard analytics fetched successfully')
  );
});

// Mark session as completed
export const completeSession = asyncHandler(async (req, res) => {
  const { sessionId, durationCompleted, caloriesBurned, rating, notes } = req.body;
  const userId = req.user._id;

  // Check if session exists
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Create completion record
  const completion = await SessionTracking.create({
    user: userId, // Changed from user_id
    session: sessionId, // Changed from session_id
    duration_completed: durationCompleted,
    calories_burned: caloriesBurned || 0,
    notes: notes || ''
    // rating is not in the schema, remove or add to SessionTracking if needed
  });

  // Update user stats
  const user = await User.findById(userId);
  user.stats.total_sessions += 1;
  user.stats.total_minutes += durationCompleted;
  user.stats.last_session = new Date();

  // Update streak
  const today = new Date();
  const lastSession = user.stats.last_session;

  if (lastSession) {
    const daysDiff = Math.floor((today - lastSession) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      user.stats.streak_days += 1;
    } else if (daysDiff > 1) {
      user.stats.streak_days = 1;
    }
  } else {
    user.stats.streak_days = 1;
  }

  await user.save({ validateBeforeSave: false }); // Skip validation if needed

  res.status(201).json(
    new ApiResponse(201, completion, 'Session completed successfully')
  );
});

// Get session analytics for session owner
export const getSessionAnalytics = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  // Check if user owns the session
  const session = await Session.findOne({
    _id: sessionId,
    createdBy: req.user._id // Assuming createdBy is the field linking to the owner
  });

  if (!session) {
    throw new ApiError(404, 'Session not found or access denied');
  }

  // Get completion stats
  const completionStats = await SessionTracking.aggregate([
    { $match: { session: session._id } }, // Changed from session_id
    {
      $group: {
        _id: null,
        total_completions: { $sum: 1 },
        avg_duration: { $avg: '$duration_completed' },
        avg_rating: { $avg: '$rating' }, // rating not in schema, will be null unless added
        total_calories_burned: { $sum: '$calories_burned' }
      }
    }
  ]);

  // Get recent completions
  const recentCompletions = await SessionTracking.find({ session: sessionId }) // Changed from session_id
    .populate('user', 'username profile.avatar') // Changed from user_id
    .sort({ completed_at: -1 })
    .limit(10);

  // Get completion trend over time
  const completionTrend = await SessionTracking.aggregate([
    { $match: { session: session._id } }, // Changed from session_id
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$completed_at" }
        },
        completions: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      session,
      stats: completionStats[0] || {
        total_completions: 0,
        avg_duration: 0,
        avg_rating: 0,
        total_calories_burned: 0
      },
      recent_completions: recentCompletions,
      completion_trend: completionTrend
    }, 'Session analytics fetched successfully')
  );
});

// Helper function to calculate streak
const calculateStreak = async (userId) => {
  const completions = await SessionTracking.find({ user: userId }) // Changed from user_id
    .sort({ completed_at: -1 })
    .limit(100); // Get last 100 completions

  if (completions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let completion of completions) {
    const completionDate = new Date(completion.completed_at);
    completionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - completionDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
};