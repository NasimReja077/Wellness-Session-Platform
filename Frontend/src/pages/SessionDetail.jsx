/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore.js';
import { useAuthStore } from '../store/authStore.js';
import { FiPlay, FiHeart, FiClock, FiUser, FiCalendar, FiTag, FiMessageCircle, FiShare2, FiCheckCircle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

const SessionDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { currentSession, loading, fetchSessionById, toggleLike, completeSession } = useSessionStore();
  const [isStarted, setIsStarted] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSessionById(id);
    }
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like sessions');
      return;
    }
    await toggleLike(id);
  };

  const handleStartSession = () => {
    setIsStarted(true);
    // Simulate session progress
    const interval = setInterval(() => {
      setSessionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);
  };

  const handleCompleteSession = async () => {
    if (!user) {
      toast.error('Please login to complete sessions');
      return;
    }

    setIsCompleting(true);
    const completionData = {
      sessionId: id,
      durationCompleted: currentSession?.duration || 0,
      caloriesBurned: currentSession?.content?.calories_burned || 0,
      notes: 'Session completed successfully!'
    };

    const result = await completeSession(completionData);
    if (result) {
      setIsStarted(false);
      setSessionProgress(0);
    }
    setIsCompleting(false);
  };

  const renderMediaContent = (url) => {
    if (!url) return null;

    // Check if it's a video URL (YouTube, Vimeo, etc.)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop() 
        : url.split('v=')[1]?.split('&')[0];
      
      return (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Session Video"
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Check if it's an image
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return (
        <img
          src={url}
          alt="Session Content"
          className="w-full h-64 md:h-96 object-cover rounded-lg"
        />
      );
    }

    // Default: show as link
    return (
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <FiPlay className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">External Content</h3>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Open Content →
          </a>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading session..." />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session not found</h2>
          <p className="text-gray-600 mb-4">The session you're looking for doesn't exist.</p>
          <Link
            to="/sessions"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          {/* Hero Image/Video */}
          <div className="relative">
            {currentSession.json_file_url ? (
              renderMediaContent(currentSession.json_file_url)
            ) : (
              <img
                src={currentSession.thumbnail || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                alt={currentSession.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            )}
            
            {/* Play Button Overlay */}
            {!isStarted && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={handleStartSession}
                  className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors group"
                >
                  <FiPlay className="text-purple-600 text-2xl ml-1 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {isStarted && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">Session Progress</span>
                  <span className="text-white text-sm">{sessionProgress}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sessionProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Title and Meta */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentSession.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  currentSession.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentSession.difficulty}
                </span>
                <span className="text-gray-500">•</span>
                <div className="flex items-center space-x-1 text-gray-600">
                  <FiClock className="text-sm" />
                  <span className="text-sm">{currentSession.duration} minutes</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {currentSession.title}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed">
                {currentSession.description}
              </p>
            </div>

            {/* Author and Actions */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <img
                  src={currentSession.createdBy?.profile?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                  alt={currentSession.createdBy?.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <Link
                    to={`/user/${currentSession.createdBy?._id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-purple-600"
                  >
                    {currentSession.createdBy?.profile?.firstName || currentSession.createdBy?.username}
                  </Link>
                  <p className="text-gray-600 text-sm">
                    Created {new Date(currentSession.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentSession.isLiked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FiHeart className={currentSession.isLiked ? 'fill-current' : ''} />
                  <span>{currentSession.engagement?.likes_count || 0}</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <FiShare2 />
                  <span>Share</span>
                </button>

                {sessionProgress === 100 && !isCompleting && (
                  <button
                    onClick={handleCompleteSession}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiCheckCircle />
                    <span>Complete Session</span>
                  </button>
                )}

                {isCompleting && (
                  <button
                    disabled
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  >
                    <LoadingSpinner size="sm" />
                    <span>Completing...</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tags */}
            {currentSession.tags && currentSession.tags.length > 0 && (
              <div className="py-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentSession.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      <FiTag className="text-xs" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Session Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Instructions */}
            {currentSession.content?.instructions && currentSession.content.instructions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>
                <div className="space-y-4">
                  {currentSession.content.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{instruction}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Equipment */}
            {currentSession.content?.equipment_needed && currentSession.content.equipment_needed.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Equipment Needed</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentSession.content.equipment_needed.map((equipment, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700">{equipment}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Nutritional Info */}
            {currentSession.content?.nutritional_info && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Nutritional Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(currentSession.content.nutritional_info).map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{value}</div>
                      <div className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Session Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiHeart className="text-red-500" />
                    <span className="text-gray-600">Likes</span>
                  </div>
                  <span className="font-semibold">{currentSession.engagement?.likes_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiUser className="text-blue-500" />
                    <span className="text-gray-600">Completions</span>
                  </div>
                  <span className="font-semibold">{currentSession.engagement?.completions_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiClock className="text-green-500" />
                    <span className="text-gray-600">Duration</span>
                  </div>
                  <span className="font-semibold">{currentSession.duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="text-purple-500" />
                    <span className="text-gray-600">Created</span>
                  </div>
                  <span className="font-semibold">
                    {new Date(currentSession.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Target Muscles */}
            {currentSession.content?.target_muscles && currentSession.content.target_muscles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Muscles</h3>
                <div className="space-y-2">
                  {currentSession.content.target_muscles.map((muscle, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-gray-700 capitalize">{muscle.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Calories */}
            {currentSession.content?.calories_burned > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white"
              >
                <h3 className="text-lg font-semibold mb-2">Calories Burned</h3>
                <div className="text-3xl font-bold">
                  {currentSession.content.calories_burned}
                </div>
                <p className="text-orange-100 text-sm">
                  Estimated calories for this session
                </p>
              </motion.div>
            )}

            {/* Related Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">More from this author</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <img
                      src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                      alt="Session thumbnail"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">Sample Session {item}</h4>
                      <p className="text-xs text-gray-600">30 min • Beginner</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;