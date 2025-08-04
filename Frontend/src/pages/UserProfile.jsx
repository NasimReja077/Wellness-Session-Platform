/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { useSessionStore } from '../store/sessionStore.js';
import { FiMapPin, FiCalendar, FiUsers, FiHeart, FiActivity, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const { fetchSessionById } = useSessionStore();
  const [profileUser, setProfileUser] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserSessions();
    } else {
      toast.error('Invalid user ID');
      setLoading(false);
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`);
      const { user, isFollowing } = response.data.data;

      setProfileUser(user);
      setFollowersCount(user.followersCount || 0);
      setIsFollowing(isFollowing || false);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load user profile');
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSessions = async () => {
    try {
      const response = await api.get(`/sessions?createdBy=${id}&status=published&privacy=public&limit=6`);
      const { sessions } = response.data.data;
      setUserSessions(sessions);
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
      toast.error('Failed to fetch user sessions');
      setUserSessions([]);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    try {
      const response = await api.post(`/users/${id}/follow`);
      const { isFollowing: newIsFollowing, followersCount: newFollowersCount } = response.data.data;
      setIsFollowing(newIsFollowing);
      setFollowersCount(newFollowersCount);
      toast.success(newIsFollowing ? 'Following user' : 'Unfollowed successfully');
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading profile..." />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="h-32 bg-gradient-to-r from-indigo-700 to-blue-700 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="relative px-8 pb-8">
            <div className="flex items-start justify-between -mt-16">
              <img
                src={
                  profileUser.profile?.avatar ||
                  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=799&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                }
                alt={profileUser.username}
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
              {currentUser && currentUser._id !== profileUser._id && (
                <div className="mt-16">
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-indigo-700 text-white hover:bg-indigo-800'
                    }`}
                    aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
                  >
                    {isFollowing ? (
                      <>
                        <FiUserCheck className="w-4 h-4 text-gray-700" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4 text-gray-300" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {profileUser.profile?.firstName && profileUser.profile?.lastName
                  ? `${profileUser.profile.firstName} ${profileUser.profile.lastName}`
                  : profileUser.username}
              </h1>
              <p className="text-gray-600 mt-1">@{profileUser.username}</p>

              {profileUser.profile?.bio && (
                <p className="text-gray-700 mt-3 max-w-2xl">{profileUser.profile.bio}</p>
              )}

              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                {profileUser.profile?.location && (
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="w-4 h-4 text-gray-700" />
                    <span>{profileUser.profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <FiCalendar className="w-4 h-4 text-gray-700" />
                  <span>
                    Joined{' '}
                    {new Date(profileUser.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiUsers className="w-4 h-4 text-gray-700" />
                  <span>{followersCount} followers</span>
                </div>
              </div>

              {profileUser.profile?.fitnessGoals && profileUser.profile.fitnessGoals.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {profileUser.profile.fitnessGoals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {goal.replace('_', ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-indigo-700">{profileUser.stats?.total_sessions || 0}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FiActivity className="text-indigo-700 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                <p className="text-3xl font-bold text-blue-700">{profileUser.stats?.total_minutes || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiActivity className="text-blue-700 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-green-600">{profileUser.stats?.streak_days || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiHeart className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* User's Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Sessions by {profileUser.profile?.firstName || profileUser.username}
            </h2>
            <p className="text-gray-600 mt-1">Discover wellness sessions created by this user</p>
          </div>

          <div className="p-6">
            {userSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userSessions.map((session) => (
                  <Link to={`/sessions/${session._id}`} key={session._id} className="group">
                    <div className="bg-white/80 backdrop-blur-md rounded-lg p-4 hover:shadow-md hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-start space-x-4">
                        <img
                          src={
                            session.thumbnail ||
                            'https://res.cloudinary.com/wellness-platform/image/upload/v1/default-session.jpg'
                          }
                          alt={session.title}
                          className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {session.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{session.description}</p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  session.difficulty === 'beginner'
                                    ? 'bg-green-100 text-green-800'
                                    : session.difficulty === 'intermediate'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {session.difficulty}
                              </span>
                              <span>{session.duration} min</span>
                            </div>

                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <FiHeart className="text-xs text-gray-700" />
                                <span>{session.engagement?.likes_count || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FiUsers className="text-xs text-gray-700" />
                                <span>{session.engagement?.completions_count || 0}</span>
                              </div>
                            </div>
                          </div>

                          {session.tags && session.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {session.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiActivity className="text-gray-700 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                <p className="text-gray-600">This user hasn't created any public sessions yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;