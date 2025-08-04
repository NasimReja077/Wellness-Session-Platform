import mongoose from 'mongoose';
import { SessionTracking } from '../models/SessionTracking.model.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id; // From verifyJWT middleware
    const timeRange = req.query.timeRange || 'week';
    let startDate = new Date();

    // Set start date based on timeRange
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeRange === 'year') {
      startDate.setDate(startDate.getDate() - 365);
    }

    // User stats (total sessions, minutes, calories)
    const userStats = await SessionTracking.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total_sessions: { $sum: 1 },
          total_minutes: { $sum: '$duration_completed' },
          total_calories: { $sum: '$calories_burned' },
        },
      },
    ]);

    // Weekly activity (grouped by date)
    const weeklyActivity = await SessionTracking.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), completed_at: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completed_at' } },
          sessions: { $sum: 1 },
          minutes: { $sum: '$duration_completed' },
          calories: { $sum: '$calories_burned' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Category stats
    const categoryStats = await SessionTracking.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'sessions',
          localField: 'session',
          foreignField: '_id',
          as: 'session_info',
        },
      },
      { $unwind: '$session_info' },
      {
        $group: {
          _id: '$session_info.category',
          count: { $sum: 1 },
          totalMinutes: { $sum: '$duration_completed' },
          totalCalories: { $sum: '$calories_burned' },
        },
      },
    ]);

    // Recent completions
    const recentCompletions = await SessionTracking.find({ user: userId })
      .populate('session', 'title category')
      .sort({ completed_at: -1 })
      .limit(5);

    // Calculate streak
    const sessions = await SessionTracking.find({ user: userId })
      .sort({ completed_at: -1 })
      .select('completed_at');
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    for (let session of sessions) {
      const sessionDate = new Date(session.completed_at);
      sessionDate.setHours(0, 0, 0, 0);
      const diffDays = (currentDate - sessionDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > 1) {
        break;
      }
    }

    // Mock goals data (replace with actual logic, e.g., from a User model)
    const goals = {
      sessions: { current: userStats[0]?.total_sessions || 0, target: 7 },
      minutes: { current: userStats[0]?.total_minutes || 0, target: 300 },
      streak: { current: streak, target: 10 },
    };

    res.json({
      data: {
        user_stats: userStats[0] || { total_sessions: 0, total_minutes: 0, total_calories: 0 },
        current_streak: streak,
        weekly_activity: weeklyActivity,
        category_stats: categoryStats,
        recent_completions: recentCompletions,
        goals,
      },
    });
  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

export const completeSession = async (req, res) => {
  try {
    const { sessionId, duration_completed, calories_burned, notes, mood_before, mood_after, completion_percentage } = req.body;
    const userId = req.user._id;

    const sessionTracking = new SessionTracking({
      user: userId,
      session: sessionId,
      duration_completed,
      calories_burned,
      notes,
      mood_before,
      mood_after,
      completion_percentage,
    });

    await sessionTracking.save();
    res.status(201).json({ data: sessionTracking });
  } catch (error) {
    console.error('Error in completeSession:', error);
    res.status(500).json({ message: 'Failed to record session completion' });
  }
};

export const getSessionAnalytics = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const analytics = await SessionTracking.aggregate([
      { $match: { session: new mongoose.Types.ObjectId(sessionId), user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total_completions: { $sum: 1 },
          total_minutes: { $sum: '$duration_completed' },
          total_calories: { $sum: '$calories_burned' },
        },
      },
    ]);

    res.json({ data: analytics[0] || { total_completions: 0, total_minutes: 0, total_calories: 0 } });
  } catch (error) {
    console.error('Error in getSessionAnalytics:', error);
    res.status(500).json({ message: 'Failed to fetch session analytics' });
  }
};