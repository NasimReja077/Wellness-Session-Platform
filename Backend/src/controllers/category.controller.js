import { Category } from '../models/Category.model.js';
import { Session } from '../models/Session.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get all categories
export const getAllCategories = asyncHandler(async (req, res) => {
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  console.log('Request query:', req.query);

  // Safely check if body exists before using Object.keys
  if (req.body && Object.keys(req.body).length > 0) {
    console.warn('Warning: GET request with body detected, ignoring body');
  }

  // Fetch categories using lean() to avoid Mongoose document issues
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();

  // Handle case where no categories are found
  if (!categories || !Array.isArray(categories)) {
    return res.status(200).json(
      new ApiResponse(200, [], 'No categories found', true)
    );
  }

  // Get session count for each category by matching category _id
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      console.log('Processing category:', category); // Debug log for category object
      if (!category || !category._id) {
        console.error('Invalid category object:', category);
        return { ...category, session_count: 0 }; // Return with 0 count if invalid
      }

      const sessionCount = await Session.countDocuments({
        category: category._id, // Ensure this is an ObjectId
        status: 'published',
        privacy: 'public'
      }).catch((err) => {
        console.error('Error in countDocuments:', err.message);
        return 0; // Return 0 on error to prevent crash
      });

      return {
        ...category,
        session_count: sessionCount
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, categoriesWithCount, 'Categories fetched successfully')
  );
});

// Create a new category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, isActive = true } = req.body;

  // Validate required fields
  if (!name) {
    throw new ApiError(400, 'Category name is required');
  }

  // Check for duplicate category (case-insensitive)
  const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingCategory) {
    throw new ApiError(409, 'Category already exists');
  }

  // Create new category
  const category = await Category.create({
    name,
    isActive
  });

  res.status(201).json(
    new ApiResponse(201, category, 'Category created successfully')
  );
});