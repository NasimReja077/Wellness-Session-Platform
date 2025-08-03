/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { FiMapPin, FiCalendar, FiUsers, FiHeart, FiActivity, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserSessions();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      // Since we don't have a specific user profile endpoint, 
      // we'll simulate it with available data
      setLoading(true);
      
      // This would be: const response = await api.get(`/users/${id}`);
      // For now, we'll create mock data based on current user structure
      const mockUser = {
        _id: id,
        username: 'wellness_guru',
        email: 'guru@wellness.com',
        profile: {
          firstName: 'Wellness',
          lastName: 'Guru',
          bio: 'Passionate wellness coach helping people transform their lives through mindful practices and healthy habits.',
          location: 'San Francisco, CA',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          fitnessGoals: ['meditation', 'yoga', 'stress_relief'],
          experienceLevel: 'advanced'
        },
        stats: {
          total_sessions: 45,
          total_minutes: 1200,
          streak_days: 15
        },
        followers: [],
        following: [],
        createdAt: '2024-01-15T00:00:00.000Z'
      };
      
      setProfileUser(mockUser);
      setFollowersCount(mockUser.followers?.length || 0);
      setIsFollowing(currentUser?.following?.includes(id) || false);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSessions = async () => {
    try {
      // This would be: const response = await api.get(`/sessions?createdBy=${id}`);
      // For now, we'll create mock sessions
      const mockSessions = [
        {
          _id: '1',
          title: 'Morning Meditation Flow',
          description: 'Start your day with mindfulness and intention setting.',
          difficulty: 'beginner',
          duration: 15,
          thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          engagement: { likes_count: 24, completions_count: 112 },
          tags: ['meditation', 'morning', 'mindfulness']
        },
        {
          _id: '2',
          title: 'Stress Relief Yoga',
          description: 'Gentle yoga sequence to release tension and find inner peace.',
          difficulty: 'intermediate',
          duration: 30,
          thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          engagement: { likes_count: 38, completions_count: 87 },
          tags: ['yoga', 'stress-relief', 'flexibility']
        }
      ];
      
      setUserSessions(mockSessions);
    } catch (error) {
      console.error('Failed to fetch user sessions:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    try {
      // This would be: await api.post(`/users/${id}/follow`);
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
      
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Following user');
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error('Failed to update follow status');
      // Revert optimistic update
      setIsFollowing(isFollowing);
      setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading profile..." />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-start justify-between -mt-16">
              <img
                src={profileUser.profile?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                alt={profileUser.username}
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />

              {/* Follow Button */}
              {currentUser && currentUser._id !== profileUser._id && (
                <div className="mt-16">
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <FiUserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* User Info */}
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
              
              {/* Meta Info */}
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                {profileUser.profile?.location && (
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="w-4 h-4" />
                    <span>{profileUser.profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiUsers className="w-4 h-4" />
                  <span>{followersCount} followers</span>
                </div>
              </div>

              {/* Fitness Goals */}
              {profileUser.profile?.fitnessGoals && profileUser.profile.fitnessGoals.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {profileUser.profile.fitnessGoals.map((goal, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-purple-600">
                  {profileUser.stats?.total_sessions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiActivity className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                <p className="text-3xl font-bold text-blue-600">
                  {profileUser.stats?.total_minutes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiActivity className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-green-600">
                  {profileUser.stats?.streak_days || 0}
                </p>
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
          className="bg-white rounded-xl shadow-lg"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Sessions by {profileUser.profile?.firstName || profileUser.username}
            </h2>
            <p className="text-gray-600 mt-1">
              Discover wellness sessions created by this user
            </p>
          </div>

          <div className="p-6">
            {userSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userSessions.map((session) => (
                  <div key={session._id} className="group">
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start space-x-4">
                        <img
                          src={session.thumbnail}
                          alt={session.title}
                          className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {session.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {session.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                session.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                session.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {session.difficulty}
                              </span>
                              <span>{session.duration} min</span>
                            </div>
                            
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <FiHeart className="text-xs" />
                                <span>{session.engagement?.likes_count || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FiUsers className="text-xs" />
                                <span>{session.engagement?.completions_count || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          {session.tags && session.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {session.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sessions yet
                </h3>
                <p className="text-gray-600">
                  This user hasn't created any public sessions yet.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;