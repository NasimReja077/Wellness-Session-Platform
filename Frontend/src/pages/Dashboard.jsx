/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { useSessionStore } from '../store/sessionStore.js';
import { FiPlus } from "react-icons/fi";
import { FiTrendingUp } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";
import { FaFireFlameCurved } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";
import { FiActivity } from "react-icons/fi";
import { FiHeart } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";
import { FiEdit } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../services/api.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { userSessions, fetchUserSessions, loading } = useSessionStore();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchUserSessions({ limit: 6 });
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get('/analytics/dashboard');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const formatChartData = (weeklyData) => {
    if (!weeklyData || weeklyData.length === 0) return [];
    
    return weeklyData.map(day => ({
      date: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
      sessions: day.sessions,
      minutes: day.minutes,
      calories: day.calories
    }));
  };

  const categoryData = analytics?.category_stats?.map(cat => ({
    name: cat._id,
    sessions: cat.count,
    minutes: cat.totalMinutes
  })) || [];

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
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.profile?.firstName || user?.username}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's your wellness journey overview
              </p>
            </div>
            <Link
              to="/session/new"
              className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <FiPlus className="mr-2" />
              Create Session
            </Link>
          </div>
        </motion.div>

        {analyticsLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" message="Loading your dashboard..." />
          </div>
        ) : (
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
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.user_stats?.total_sessions || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <FiActivity className="text-white text-xl" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-green-600 font-medium">↗ 12%</span> from last week
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.user_stats?.total_minutes || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <FiClock className="text-white text-xl" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-green-600 font-medium">↗ 8%</span> from last week
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.current_streak || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <FaFireFlameCurved className="text-white text-xl" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-orange-600 font-medium">🔥</span> Keep it up!
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.weekly_activity?.reduce((sum, day) => sum + day.sessions, 0) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <FiCalendar className="text-white text-xl" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Sessions completed
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Activity Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData(analytics?.weekly_activity)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Category Breakdown */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Recent Sessions */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Your Sessions</h3>
                  <Link
                    to="/sessions/my/all"
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner message="Loading your sessions..." />
                  </div>
                ) : userSessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userSessions.map((session) => (
                      <div key={session._id} className="group relative">
                        <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {session.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {session.description}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Link
                                to={`/session/edit/${session._id}`}
                                className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <FiEdit className="text-gray-600 hover:text-blue-600" />
                              </Link>
                              <button className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200">
                                <FiTrash2 className="text-gray-600 hover:text-red-600" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <FiClock className="text-xs" />
                                <span>{session.duration} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FiHeart className="text-xs" />
                                <span>{session.engagement?.likes_count || 0}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiActivity className="text-gray-400 text-2xl" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No sessions yet
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Create your first wellness session to get started
                    </p>
                    <Link
                      to="/session/new"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <FiPlus className="mr-2" />
                      Create Session
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Completions */}
            {analytics?.recent_completions && analytics.recent_completions.length > 0 && (
              <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Completions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.recent_completions.slice(0, 5).map((completion, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {completion.session?.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Completed {new Date(completion.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <FiClock className="text-xs" />
                            <span>{completion.duration_completed} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiFire className="text-xs" />
                            <span>{completion.calories_burned} cal</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;