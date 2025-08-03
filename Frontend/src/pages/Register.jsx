/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    const { confirmPassword, ...registrationData } = data;

    const result = await registerUser({
      ...registrationData,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName
      }
    });

    if (result.success) {
      toast.success('Account created successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  const inputClass = (hasError) => `block w-full px-3 py-3 border ${
    hasError ? 'border-red-400' : 'border-gray-500'
  } text-gray-800 rounded-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200`;

  const iconClass = 'h-5 w-5 text-gray-500';

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-300 via-purple-300 to-pink-300 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <Toaster />
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-white text-2xl font-bold">W</span>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Wellness</h2>
            <p className="text-gray-600">Create your account and start your wellness journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input type="text" {...register('firstName', { required: 'First name is required', minLength: { value: 2, message: 'First name must be at least 2 characters' } })} className={inputClass(errors.firstName)} placeholder="John" />
                {errors.firstName && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.firstName.message}</motion.p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input type="text" {...register('lastName', { required: 'Last name is required', minLength: { value: 2, message: 'Last name must be at least 2 characters' } })} className={inputClass(errors.lastName)} placeholder="Doe" />
                {errors.lastName && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.lastName.message}</motion.p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className={iconClass} />
                </div>
                <input type="text" {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Username must be at least 3 characters' }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, underscores allowed' } })} className={`pl-10 pr-3 ${inputClass(errors.username)}`} placeholder="johndoe" />
              </div>
              {errors.username && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.username.message}</motion.p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className={iconClass} />
                </div>
                <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email' } })} className={`pl-10 pr-3 ${inputClass(errors.email)}`} placeholder="john@example.com" />
              </div>
              {errors.email && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.email.message}</motion.p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={iconClass} />
                </div>
                <input type={showPassword ? 'text' : 'password'} {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase, and number' } })} className={`pl-10 pr-12 ${inputClass(errors.password)}`} placeholder="Create a strong password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? <FiEyeOff className={iconClass} /> : <FiEye className={iconClass} />}
                </button>
              </div>
              {errors.password && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.password.message}</motion.p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={iconClass} />
                </div>
                <input type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword', { required: 'Please confirm password', validate: (value) => value === password || 'Passwords do not match' })} className={`pl-10 pr-12 ${inputClass(errors.confirmPassword)}`} placeholder="Confirm your password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showConfirmPassword ? <FiEyeOff className={iconClass} /> : <FiEye className={iconClass} />}
                </button>
              </div>
              {errors.confirmPassword && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</motion.p>}
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg'}`}>
              {loading ? (<><FiLoader className="animate-spin mr-2" />Creating Account...</>) : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">Already have an account?{' '}<Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">Sign in here</Link></p>
          </div>
        </motion.div>
        <div className="absolute top-10 right-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000" />
      </div>
    </div>
  );
};

export default Register;
