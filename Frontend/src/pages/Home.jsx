/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore.js';
import { useAuthStore } from '../store/authStore.js';
import { FiPlay, FiClock, FiTrendingUp, FiUsers, FiHeart, FiArrowRight, FiStar } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Home = () => {
  const { sessions, loading, fetchSessions, categories, fetchCategories } = useSessionStore();
  const { user } = useAuthStore();
  const [featuredSessions, setFeaturedSessions] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchSessions({ limit: 6, sort: 'popular' });
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      setFeaturedSessions(sessions.slice(0, 6));
    } else {
      setFeaturedSessions([]);
    }
  }, [sessions]);

  const features = [
    {
      icon: <FiPlay className="text-2xl" />,
      title: 'Guided Sessions',
      description: 'Follow expert-led wellness sessions tailored to your goals and experience level.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FiTrendingUp className="text-2xl" />,
      title: 'Track Progress',
      description: 'Monitor your wellness journey with detailed analytics and achievement tracking.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FiUsers className="text-2xl" />,
      title: 'Community',
      description: 'Connect with like-minded individuals and share your wellness experiences.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <FiHeart className="text-2xl" />,
      title: 'Personalized',
      description: 'Get personalized recommendations based on your preferences and goals.',
      color: 'from-red-500 to-rose-500'
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Wellness Journey
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover guided wellness sessions, track your progress, and join a community 
              of wellness enthusiasts. Your path to better health starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/sessions"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-purple-600 hover:text-purple-600 transition-all duration-200"
                  >
                    Browse Sessions
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/sessions"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-purple-600 hover:text-purple-600 transition-all duration-200"
                  >
                    Explore Sessions
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-bounce" />
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-bounce delay-1000" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to embark on and maintain your wellness journey.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group"
              >
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Sessions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Sessions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most loved wellness sessions from the community.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" message="Loading featured sessions..." />
            </div>
          ) : featuredSessions.length === 0 ? (
            <div className="text-center py-8">
              <FiStar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No sessions available</h4>
              <p className="text-gray-600">Check back later for new wellness sessions!</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredSessions.map((session, index) => (
                <motion.div
                  key={session._id}
                  variants={itemVariants}
                  className="group"
                >
                  <Link to={`/sessions/${session._id}`}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                      <div className="relative">
                        <img
                          src={session.thumbnail || 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                          alt={session.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            session.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {session.difficulty || 'Unknown'}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1">
                          <FiClock className="text-xs" />
                          <span>{session.duration} min</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {session.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {session.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <FiHeart className="text-xs" />
                              <span>{session.engagement?.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FiUsers className="text-xs" />
                              <span>{session.engagement?.completions_count || 0}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-purple-600 text-sm font-medium">
                            <span>Start Session</span>
                            <FiArrowRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              to="/sessions"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <span>View All Sessions</span>
              <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their lives through our platform.
            </p>
            {!user && (
              <Link
                to="/register"
                className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started Today
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;