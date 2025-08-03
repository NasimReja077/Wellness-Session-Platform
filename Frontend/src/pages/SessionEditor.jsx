/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSessionStore } from '../store/sessionStore.js';
import { FiSave, FiSend, FiPlus, FiTrash2, FiLoader, FiX, FiTag } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

// Reusable InputField Component
const InputField = ({ label, name, register, errors, type = 'text', placeholder, className, ...props }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        id={name}
        {...register(name, props.validation)}
        className={`w-full px-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200 ${className} ${
          errors[name] ? 'border-red-500 focus:ring-red-500' : ''
        }`}
        placeholder={placeholder}
        aria-label={label}
      />
      {errors[name] && (
        <span className="absolute right-3 top-3 text-red-600">
          <FiX className="w-4 h-4" />
        </span>
      )}
    </div>
    {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>}
  </div>
);

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
    autoSaveStatus,
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
    formState: { errors, isDirty },
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
          sodium: 0,
        },
      },
    },
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: 'content.instructions',
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({
    control,
    name: 'content.equipment_needed',
  });

  const watchedFields = watch();

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchSessionById(id).then((session) => {
        if (session) {
          Object.keys(session).forEach((key) => {
            if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
              setValue(key, session[key]);
            }
          });
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (isDirty && watchedFields.title) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 5000);
      setAutoSaveTimer(timer);
    }
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
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
        if (result?._id) setDraftId(result._id);
      }
      if (result) {
        setLastSaved(new Date());
        toast.success('Draft auto-saved', {
          style: {
            background: '#059669',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px',
          },
        });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Auto-save failed', {
        style: {
          background: '#DC2626',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px',
        },
      });
    }
  };

  const onSaveDraft = async (data) => {
    try {
      let result;
      if (draftId) {
        result = await updateDraftSession({ ...data, sessionId: draftId });
      } else {
        result = await createDraftSession(data);
        if (result?._id) setDraftId(result._id);
      }
      if (result) {
        setLastSaved(new Date());
        toast.success('Draft saved successfully!', {
          style: {
            background: '#059669',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px',
          },
        });
      }
    } catch (error) {
      toast.error('Failed to save draft', {
        style: {
          background: '#DC2626',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px',
        },
      });
    }
  };

  const onPublish = async (data) => {
    try {
      let sessionIdToPublish = draftId;
      if (!sessionIdToPublish) {
        const draftResult = await createDraftSession(data);
        if (draftResult?._id) {
          sessionIdToPublish = draftResult._id;
        } else {
          throw new Error('Failed to create draft');
        }
      } else {
        await updateDraftSession({ ...data, sessionId: sessionIdToPublish });
      }
      const publishResult = await publishSession(sessionIdToPublish);
      if (publishResult) {
        navigate(`/sessions/${publishResult._id}`);
        toast.success('Session published successfully!', {
          style: {
            background: '#059669',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px',
          },
        });
      }
    } catch (error) {
      toast.error('Failed to publish session', {
        style: {
          background: '#DC2626',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px',
        },
      });
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
    setValue('tags', watchedFields.tags?.filter((tag) => tag !== tagToRemove) || []);
  };

  const targetMuscleOptions = [
    'core',
    'legs',
    'arms',
    'back',
    'chest',
    'shoulders',
    'glutes',
    'full_body',
  ];

  const toggleTargetMuscle = (muscle) => {
    const currentMuscles = watchedFields.content?.target_muscles || [];
    const updatedMuscles = currentMuscles.includes(muscle)
      ? currentMuscles.filter((m) => m !== muscle)
      : [...currentMuscles, muscle];
    setValue('content.target_muscles', updatedMuscles);
  };

  if (loading && id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading session..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? 'Edit Session' : 'Create New Session'}
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Share your wellness expertise with the community
              </p>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              {autoSaveStatus === 'saving' && (
                <>
                  <FiLoader className="animate-spin text-gray-700" />
                  <span>Saving...</span>
                </>
              )}
              {lastSaved && autoSaveStatus === 'saved' && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="text-red-600">Auto-save failed</span>
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
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <InputField
                label="Session Title *"
                name="title"
                register={register}
                errors={errors}
                placeholder="Enter your session title"
                validation={{
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                }}
              />
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
                  placeholder="Describe your session..."
                  aria-label="Description"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className={`w-full px-4 py-3 border rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200 ${
                      errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-500'
                    }`}
                    aria-label="Category"
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
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Difficulty *
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
                    aria-label="Difficulty"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <InputField
                  label="Duration (minutes) *"
                  name="duration"
                  type="number"
                  register={register}
                  errors={errors}
                  placeholder="30"
                  validation={{
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 minute' },
                    max: { value: 300, message: 'Duration cannot exceed 300 minutes' },
                  }}
                  className="w-full sm:w-32"
                />
              </div>
              <InputField
                label="Media URL (Video/Image/Link)"
                name="json_file_url"
                type="url"
                register={register}
                errors={errors}
                placeholder="https://example.com/video-or-image"
                className="w-full"
              />
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">Tags</label>
                <div className="relative">
                  <FiTag className="absolute left-3 top-3.5 text-gray-700" />
                  <input
                    type="text"
                    onKeyDown={addTag}
                    className="w-full pl-10 pr-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
                    placeholder="Type tags and press Enter or comma to add"
                    aria-label="Tags"
                  />
                </div>
                {watchedFields.tags && watchedFields.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {watchedFields.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-indigo-700 hover:text-indigo-900"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
              <button
                type="button"
                onClick={() => appendInstruction('')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-all duration-200"
                aria-label="Add instruction step"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Step</span>
              </button>
            </div>
            <div className="space-y-4">
              {instructionFields.map((field, index) => (
                <div key={field.id} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-700 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      {...register(`content.instructions.${index}`)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
                      placeholder={`Step ${index + 1} instructions...`}
                      aria-label={`Instruction step ${index + 1}`}
                    />
                  </div>
                  {instructionFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 mt-2"
                      aria-label={`Remove instruction step ${index + 1}`}
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
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Equipment Needed</h2>
              <button
                type="button"
                onClick={() => appendEquipment('')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-all duration-200"
                aria-label="Add equipment"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Equipment</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {equipmentFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    {...register(`content.equipment_needed.${index}`)}
                    className="flex-1 px-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
                    placeholder="Equipment name"
                    aria-label={`Equipment ${index + 1}`}
                  />
                  {equipmentFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      aria-label={`Remove equipment ${index + 1}`}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Target Muscles
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {targetMuscleOptions.map((muscle) => (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => toggleTargetMuscle(muscle)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        watchedFields.content?.target_muscles?.includes(muscle)
                          ? 'bg-indigo-700 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      aria-label={`Toggle ${muscle} muscle`}
                    >
                      {muscle.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <InputField
                label="Estimated Calories Burned"
                name="content.calories_burned"
                type="number"
                register={register}
                errors={errors}
                placeholder="0"
                validation={{ min: { value: 0, message: 'Calories cannot be negative' } }}
                className="w-full sm:w-48"
              />
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Nutritional Information (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['calories', 'protein', 'carbs', 'fat'].map((field) => (
                    <InputField
                      key={field}
                      label={`${field.charAt(0).toUpperCase() + field.slice(1)} ${
                        field === 'calories' ? '' : '(g)'
                      }`}
                      name={`content.nutritional_info.${field}`}
                      type="number"
                      register={register}
                      errors={errors}
                      placeholder="0"
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Privacy
                </label>
                <select
                  {...register('privacy')}
                  className="w-full sm:w-48 px-4 py-3 border border-gray-500 rounded-lg bg-white/80 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
                  aria-label="Privacy"
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
              className="flex items-center justify-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Save draft"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2 text-gray-300" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 text-gray-300" />
                  Save Draft
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSubmit(onPublish)}
              disabled={loading}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-700 to-blue-700 text-white rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              aria-label="Publish session"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2 text-gray-300" />
                  Publishing...
                </>
              ) : (
                <>
                  <FiSend className="mr-2 text-gray-300" />
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