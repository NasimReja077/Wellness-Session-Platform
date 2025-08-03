/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { FiUser, FiMail, FiMapPin, FiEdit, FiSave, FiX, FiCamera, FiHeart, FiActivity, FiUsers, FiTarget } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

// Reusable InputField Component
const InputField = ({ label, name, register, errors, type = 'text', placeholder, disabled, className, ...props }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      id={name}
      {...register(name, props.validation)}
      disabled={disabled}
      className={`w-full px-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200 ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      } ${errors[name] ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
      placeholder={placeholder}
      aria-label={label}
    />
    {errors[name] && (
      <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
    )}
  </div>
);

// Reusable TextareaField Component
const TextareaField = ({ label, name, register, disabled, placeholder, className }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1.5">
      {label}
    </label>
    <textarea
      id={name}
      {...register(name)}
      disabled={disabled}
      rows={4}
      className={`w-full px-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200 ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      } ${className}`}
      placeholder={placeholder}
      aria-label={label}
    />
  </div>
);

const Profile = () => {
  const { user, updateProfile, loading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      age: user?.profile?.age || '',
      height: user?.profile?.height || '',
      weight: user?.profile?.weight || '',
      fitnessGoals: user?.profile?.fitnessGoals || [],
      dietaryPreferences: user?.profile?.dietaryPreferences || [],
      experienceLevel: user?.profile?.experienceLevel || 'beginner',
    },
  });

  const watchedFields = watch();

  const fitnessGoalsOptions = [
    'weight_loss',
    'muscle_gain',
    'flexibility',
    'endurance',
    'strength',
    'stress_relief',
    'better_sleep',
    'yoga',
    'meditation',
    'fitness',
    'nutrition',
    'mindfulness',
  ];

  const dietaryPreferencesOptions = [
    'vegetarian',
    'vegan',
    'gluten_free',
    'dairy_free',
    'keto',
    'paleo',
    'mediterranean',
  ];

  const experienceLevels = ['beginner', 'intermediate', 'advanced'];

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const toggleGoal = (goal) => {
    const currentGoals = watchedFields.fitnessGoals || [];
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter((g) => g !== goal)
      : [...currentGoals, goal];
    setValue('fitnessGoals', updatedGoals);
  };

  const toggleDietaryPreference = (pref) => {
    const currentPrefs = watchedFields.dietaryPreferences || [];
    const updatedPrefs = currentPrefs.includes(pref)
      ? currentPrefs.filter((p) => p !== pref)
      : [...currentPrefs, pref];
    setValue('dietaryPreferences', updatedPrefs);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: FiUser },
    { id: 'stats', label: 'Stats', icon: FiActivity },
    { id: 'goals', label: 'Goals & Preferences', icon: FiTarget },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-indigo-700 to-blue-700 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Header */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-start justify-between -mt-16">
              <div className="relative">
                <img
                  src={
                    user?.profile?.avatar ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                  }
                  alt={user?.username}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
                <button
                  className="absolute bottom-2 right-2 w-10 h-10 bg-indigo-700 text-white rounded-full flex items-center justify-center hover:bg-indigo-800 transition-all duration-200"
                  aria-label="Change profile picture"
                >
                  <FiCamera className="w-4 h-4 text-gray-300" />
                </button>
              </div>

              {/* Edit Button */}
              <div className="mt-16">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-all duration-200"
                    aria-label="Edit profile"
                  >
                    <FiEdit className="w-4 h-4 text-gray-300" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
                      aria-label="Cancel edit"
                    >
                      <FiX className="w-4 h-4 text-gray-700" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Save profile changes"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FiSave className="w-4 h-4 text-gray-300" />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="mt-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.profile?.firstName && user?.profile?.lastName
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user?.username}
              </h1>
              <p className="text-gray-600 mt-1">@{user?.username}</p>
              {user?.profile?.bio && (
                <p className="text-gray-700 mt-3 max-w-2xl">{user.profile.bio}</p>
              )}
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <FiMail className="w-4 h-4 text-gray-700" />
                  <span>{user?.email}</span>
                </div>
                {user?.profile?.location && (
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="w-4 h-4 text-gray-700" />
                    <span>{user.profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <FiUsers className="w-4 h-4 text-gray-700" />
                  <span>{user?.followersCount || 0} followers</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-500">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-700 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                    aria-label={`Switch to ${tab.label} tab`}
                  >
                    <Icon className="w-4 h-4 text-gray-700" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  name="firstName"
                  register={register}
                  errors={errors}
                  disabled={!isEditing}
                  placeholder="Enter your first name"
                />
                <InputField
                  label="Last Name"
                  name="lastName"
                  register={register}
                  errors={errors}
                  disabled={!isEditing}
                  placeholder="Enter your last name"
                />
                <div className="md:col-span-2">
                  <TextareaField
                    label="Bio"
                    name="bio"
                    register={register}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <InputField
                  label="Location"
                  name="location"
                  register={register}
                  errors={errors}
                  disabled={!isEditing}
                  placeholder="City, Country"
                />
                <InputField
                  label="Age"
                  name="age"
                  type="number"
                  register={register}
                  errors={errors}
                  disabled={!isEditing}
                  placeholder="Enter your age"
                  validation={{
                    min: { value: 13, message: 'Must be at least 13 years old' },
                    max: { value: 150, message: 'Invalid age' },
                  }}
                  className="w-full md:w-32"
                />
                <InputField
                  label="Height (cm)"
                  name="height"
                  type="number"
                  register={register}
                  errors={errors}
                  disabled={!isEditing}
                  placeholder="Enter your height"
                  validation={{
                    min: { value: 50, message: 'Height must be at least 50cm' },
                    max: { value: 300, message: 'Height cannot exceed 300cm' },
                  }}
                  className="w-full md:w-32"
                />
                <InputField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  register={register}
                  errors={errors}
                  disabled={!isEditing}
                  placeholder="Enter your weight"
                  validation={{
                    min: { value: 15, message: 'Weight must be at least 15kg' },
                    max: { value: 500, message: 'Weight cannot exceed 500kg' },
                  }}
                  className="w-full md:w-32"
                />
              </div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-3xl font-bold text-indigo-700">
                        {user?.stats?.total_sessions || 0}
                      </p>
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
                      <p className="text-3xl font-bold text-blue-700">
                        {user?.stats?.total_minutes || 0}
                      </p>
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
                      <p className="text-3xl font-bold text-green-600">
                        {user?.stats?.streak_days || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiHeart className="text-green-600 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Activity Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user?.followersCount || 0}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user?.followingCount || 0}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {user?.stats?.last_session ? new Date(user.stats.last_session).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-sm text-gray-600">Last Session</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600">Member Since</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Goals & Preferences Tab */}
          {activeTab === 'goals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Goals & Preferences</h2>
              <div className="space-y-8">
                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-3">
                    Experience Level
                  </label>
                  <div className="flex space-x-4">
                    {experienceLevels.map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          {...register('experienceLevel')}
                          value={level}
                          disabled={!isEditing}
                          className="sr-only"
                        />
                        <div
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                            watchedFields.experienceLevel === level
                              ? 'bg-indigo-700 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fitness Goals */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-3">
                    Fitness Goals
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {fitnessGoalsOptions.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => isEditing && toggleGoal(goal)}
                        disabled={!isEditing}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          watchedFields.fitnessGoals?.includes(goal)
                            ? 'bg-indigo-700 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={`Toggle ${goal.replace('_', ' ')} goal`}
                      >
                        {goal.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-3">
                    Dietary Preferences
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dietaryPreferencesOptions.map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => isEditing && toggleDietaryPreference(pref)}
                        disabled={!isEditing}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          watchedFields.dietaryPreferences?.includes(pref)
                            ? 'bg-indigo-700 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={`Toggle ${pref.replace('_', ' ')} preference`}
                      >
                        {pref.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;