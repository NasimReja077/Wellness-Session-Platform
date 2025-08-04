/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiActivity, FiClock, FiStar, FiCalendar, FiTarget } from 'react-icons/fi'; // Changed FiFlame to FiStar
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const { user, loading: authLoading } = useAuthStore();

  const fetchAnalytics = useCallback(async () => {
    if (!user || authLoading) {
      console.log('Waiting for authentication to complete');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/analytics/dashboard?timeRange=${timeRange}`);
      console.log('Analytics API response:', JSON.stringify(response.data, null, 2)); // Detailed debug log
      if (!response.data?.data) {
        throw new Error('Invalid response structure: Missing data field');
      }
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      const message = error.response?.data?.message || error.message || 'Failed to load analytics data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [timeRange, user, authLoading]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatChartData = (weeklyData) => {
    if (!weeklyData || !Array.isArray(weeklyData) || weeklyData.length === 0) {
      console.log('No weekly data available');
      return [];
    }
    
    return weeklyData.map(day => ({
      date: day._id ? new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
      sessions: day.sessions || 0,
      minutes: day.minutes || 0,
      calories: day.calories || 0
    }));
  };

  const categoryData = analytics?.category_stats?.map(cat => ({
    name: cat._id || 'Unknown',
    sessions: cat.count || 0,
    minutes: cat.totalMinutes || 0,
    calories: cat.totalCalories || 0
  })) || [];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiTrendingUp className="mr-3 text-purple-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Track your wellness journey and session performance
              </p>
            </div>

            {/* Time Range Filter */}
            <div className="mt-4 md:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics?.user_stats?.total_sessions || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">↗ +12% from last week</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiActivity className="text-purple-600 text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics?.user_stats?.total_minutes || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">↗ +8% from last week</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiClock className="text-blue-600 text-xl" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics?.current_streak || 0}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">🔥 Keep it going!</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiStar className="text-green-600 text-xl" /> {/* Changed FiFlame to FiStar */}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-red-600">
                    {analytics?.weekly_activity?.reduce((sum, day) => sum + (day.sessions || 0), 0) || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Sessions completed</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-red-600 text-xl" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Activity Trend */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Activity Trend</h3>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-xs text-gray-600">Sessions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-xs text-gray-600">Minutes</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                {analytics?.weekly_activity?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData(analytics.weekly_activity)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                      <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-600">No activity data available</div>
                )}
              </div>
            </motion.div>

            {/* Category Performance */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
              <div className="h-64">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-600">No category data available</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Distribution */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Session Distribution</h3>
              <div className="h-64">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-600">No session distribution data available</div>
                )}
              </div>
            </motion.div>

            {/* Weekly Goals */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Goals</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Sessions Goal</span>
                    <span className="text-sm text-gray-600">
                      {analytics?.goals?.sessions?.current || 0}/{analytics?.goals?.sessions?.target || 7}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((analytics?.goals?.sessions?.current || 0) / (analytics?.goals?.sessions?.target || 7)) * 100
                        }%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Minutes Goal</span>
                    <span className="text-sm text-gray-600">
                      {analytics?.goals?.minutes?.current || 0}/{analytics?.goals?.minutes?.target || 300}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((analytics?.goals?.minutes?.current || 0) / (analytics?.goals?.minutes?.target || 300)) * 100
                        }%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Streak Goal</span>
                    <span className="text-sm text-gray-600">
                      {analytics?.goals?.streak?.current || 0}/{analytics?.goals?.streak?.target || 10}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((analytics?.goals?.streak?.current || 0) / (analytics?.goals?.streak?.target || 10)) * 100
                        }%`
                      }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FiTarget className="w-4 h-4" />
                    <span>You're on track to meet your goals!</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Achievements</h3>
              <div className="space-y-4">
                {/* Hardcoded for now; consider fetching from /analytics/achievements */}
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <FiStar className="text-white text-sm" /> {/* Changed FiFlame to FiStar */}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">7-Day Streak</h4>
                    <p className="text-sm text-gray-600">Completed sessions for 7 days in a row</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <FiActivity className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">100 Minutes</h4>
                    <p className="text-sm text-gray-600">Reached 100 total minutes this week</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <FiStar className="text-white text-sm" /> {/* Changed FiFlame to FiStar */}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">First Session</h4>
                    <p className="text-sm text-gray-600">Completed your first wellness session</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              {analytics?.recent_completions && analytics.recent_completions.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recent_completions.slice(0, 5).map((completion, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <FiActivity className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {completion.session?.title || 'Untitled Session'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Completed {new Date(completion.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <FiClock className="text-xs" />
                          <span>{completion.duration_completed || 0} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiStar className="text-xs" /> {/* Changed FiFlame to FiStar */}
                          <span>{completion.calories_burned || 0} cal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h4>
                  <p className="text-gray-600">Complete your first session to see activity here</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;