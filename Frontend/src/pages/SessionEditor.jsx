/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSessionStore } from '../store/sessionStore.js';
import { FiSave, FiSend, FiPlus, FiTrash2, FiLoader, FiX } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

const SessionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    categories,
    fetchCategories,
    createDraftSession,
    updateDraftSession,
    publishSession,
    fetchSessionById,
    currentSession,
    loading,
    autoSaveStatus
  } = useSessionStore();

  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [draftId, setDraftId] = useState(id || null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: [],
      difficulty: 'beginner',
      duration: 30,
      json_file_url: '',
      privacy: 'public',
      content: {
        instructions: [''],
        equipment_needed: [''],
        calories_burned: 0,
        target_muscles: [],
        nutritional_info: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0
        }
      }
    }
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction
  } = useFieldArray({
    control,
    name: 'content.instructions'
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment
  } = useFieldArray({
    control,
    name: 'content.equipment_needed'
  });

  const watchedFields = watch();

  useEffect(() => {
    fetchCategories();

    // If editing existing session, fetch it
    if (id) {
      fetchSessionById(id).then((session) => {
        if (session) {
          // Populate form with existing data
          Object.keys(session).forEach((key) => {
            if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
              setValue(key, session[key]);
            }
          });
        }
      });
    }
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && watchedFields.title) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      // Set new timer for auto-save
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 5000); // Auto-save after 5 seconds of inactivity

      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [watchedFields]);

  const handleAutoSave = async () => {
    const formData = watchedFields;
    
    if (!formData.title?.trim()) return;

    try {
      let result;
      if (draftId) {
        result = await updateDraftSession({ ...formData, sessionId: draftId });
      } else {
        result = await createDraftSession(formData);
        if (result?._id) {
          setDraftId(result._id);
        }
      }
      
      if (result) {
        setLastSaved(new Date());
        toast.success('Draft auto-saved', { duration: 2000 });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const onSaveDraft = async (data) => {
    try {
      let result;
      if (draftId) {
        result = await updateDraftSession({ ...data, sessionId: draftId });
      } else {
        result = await createDraftSession(data);
        if (result?._id) {
          setDraftId(result._id);
        }
      }
      
      if (result) {
        setLastSaved(new Date());
        toast.success('Draft saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const onPublish = async (data) => {
    try {
      // First save as draft if not already saved
      let sessionIdToPublish = draftId;
      
      if (!sessionIdToPublish) {
        const draftResult = await createDraftSession(data);
        if (draftResult?._id) {
          sessionIdToPublish = draftResult._id;
        } else {
          throw new Error('Failed to create draft');
        }
      } else {
        // Update existing draft
        await updateDraftSession({ ...data, sessionId: sessionIdToPublish });
      }

      // Then publish
      const publishResult = await publishSession(sessionIdToPublish);
      if (publishResult) {
        navigate(`/sessions/${publishResult._id}`);
      }
    } catch (error) {
      toast.error('Failed to publish session');
    }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !watchedFields.tags?.includes(value)) {
        setValue('tags', [...(watchedFields.tags || []), value]);
        e.target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setValue('tags', watchedFields.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const targetMuscleOptions = [
    'core', 'legs', 'arms', 'back', 'chest', 'shoulders', 'glutes', 'full_body'
  ];

  const toggleTargetMuscle = (muscle) => {
    const currentMuscles = watchedFields.content?.target_muscles || [];
    const updatedMuscles = currentMuscles.includes(muscle)
      ? currentMuscles.filter(m => m !== muscle)
      : [...currentMuscles, muscle];
    
    setValue('content.target_muscles', updatedMuscles);
  };

  if (loading && id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading session..." />
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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? 'Edit Session' : 'Create New Session'}
              </h1>
              <p className="text-gray-600 mt-2">
                Share your wellness expertise with the community
              </p>
            </div>

            {/* Auto-save status */}
            <div className="text-sm text-gray-500">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center space-x-2">
                  <FiLoader className="animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {lastSaved && autoSaveStatus === 'saved' && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="text-red-500">Auto-save failed</span>
              )}
            </div>
          </div>
        </motion.div>

        <form className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' }
                  })}
                  className={`w-full px-4 py-3 border ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter your session title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your session..."
                />
              </div>

              {/* Category and Settings Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className={`w-full px-4 py-3 border ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    {...register('duration', {
                      required: 'Duration is required',
                      min: { value: 1, message: 'Duration must be at least 1 minute' },
                      max: { value: 300, message: 'Duration cannot exceed 300 minutes' }
                    })}
                    className={`w-full px-4 py-3 border ${
                      errors.duration ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    min="1"
                    max="300"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              {/* Media URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media URL (Video/Image/Link)
                </label>
                <input
                  type="url"
                  {...register('json_file_url')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/video-or-image"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Add a YouTube video, image, or any other content link
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    onKeyDown={addTag}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Type tags and press Enter or comma to add"
                  />
                  {watchedFields.tags && watchedFields.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedFields.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-purple-500 hover:text-purple-700"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
              <button
                type="button"
                onClick={() => appendInstruction('')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-4">
              {instructionFields.map((field, index) => (
                <div key={field.id} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      {...register(`content.instructions.${index}`)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`Step ${index + 1} instructions...`}
                    />
                  </div>
                  {instructionFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Equipment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Equipment Needed</h2>
              <button
                type="button"
                onClick={() => appendEquipment('')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Equipment</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipmentFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    {...register(`content.equipment_needed.${index}`)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Equipment name"
                  />
                  {equipmentFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Target Muscles & Health Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div className="space-y-6">
              {/* Target Muscles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Target Muscles
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {targetMuscleOptions.map((muscle) => (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => toggleTargetMuscle(muscle)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        watchedFields.content?.target_muscles?.includes(muscle)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {muscle.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Calories Burned
                </label>
                <input
                  type="number"
                  {...register('content.calories_burned', {
                    min: { value: 0, message: 'Calories cannot be negative' }
                  })}
                  className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  placeholder="0"
                />
              </div>

              {/* Nutritional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nutritional Information (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Calories</label>
                    <input
                      type="number"
                      {...register('content.nutritional_info.calories')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      {...register('content.nutritional_info.protein')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      {...register('content.nutritional_info.carbs')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fat (g)</label>
                    <input
                      type="number"
                      {...register('content.nutritional_info.fat')}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy
                </label>
                <select
                  {...register('privacy')}
                  className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-end"
          >
            <button
              type="button"
              onClick={handleSubmit(onSaveDraft)}
              disabled={loading}
              className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Draft
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSubmit(onPublish)}
              disabled={loading}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Publish Session
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default SessionEditor;