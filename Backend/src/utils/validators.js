import { body, param, query, validationResult } from 'express-validator';

// Validation middleware to handle errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const userValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('profile.firstName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),
    body('profile.lastName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),
    body('profile.age')
      .optional()
      .isInt({ min: 13, max: 150 })
      .withMessage('Age must be between 13 and 120'),
    body('profile.height')
      .optional()
      .isFloat({ min: 50, max: 300 })
      .withMessage('Height must be between 50cm and 300cm'),
    body('profile.weight')
      .optional()
      .isFloat({ min: 15, max: 500 })
      .withMessage('Weight must be between 20kg and 500kg')
  ],
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

// Session validation rules
export const sessionValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage('Title must be between 3 and 150 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 100000 })
      .withMessage('Description cannot exceed 100000 characters'),
    body('category')
      .isMongoId()
      .withMessage('Category must be a valid category ID'),
    body('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid difficulty level'),
    body('duration')
      .isInt({ min: 1, max: 300 })
      .withMessage('Duration must be between 1 and 300 minutes'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each tag must be between 1 and 50 characters'),
    body('json_file_url')
      .optional()
      .isURL()
      .withMessage('JSON file URL must be a valid URL'),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be true or false')
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid session ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 100000 })
      .withMessage('Description cannot exceed 100000 characters'),
    body('category')
      .optional()
      .isMongoId()
      .withMessage('Category must be a valid category ID'),
    body('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid difficulty level'),
    body('duration')
      .optional()
      .isInt({ min: 1, max: 300 })
      .withMessage('Duration must be between 1 and 300 minutes'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each tag must be between 1 and 50 characters'),
    body('json_file_url')
      .optional()
      .isURL()
      .withMessage('JSON file URL must be a valid URL'),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be true or false')
  ]
};

// Comment validation rules
export const commentValidation = {
  create: [
    body('content')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Comment content is required and cannot exceed 500 characters'),
    param('sessionId')
      .isMongoId()
      .withMessage('Invalid session ID')
  ]
};

// Progress validation rules
export const sessionTrackingValidation = {
  create: [
    body('session')
      .isMongoId()
      .withMessage('Invalid session ID'),
    body('duration_completed')
      .isInt({ min: 0 })
      .withMessage('Duration completed must be a positive number'),
    body('calories_burned')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Calories burned must be a positive number')
  ]
};

// Query validation rules
export const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limit must be between 1 and 1000')
  ],
  sessions: [
    query('category')
      .custom(async (value, { req }) => {
        // Only validate if a category value is provided in the query
        if (value) {
          const validCategories = await getValidCategoryNames();
          if (!validCategories.includes(value)) {
            throw new Error('Invalid category');
          }
        }
        return true; // Indicate validation success if no value or if value is valid
      })
      .withMessage('Invalid category'), // This message will be used if the custom validator throws an error
    query('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid difficulty level'),
    query('sort')
      .optional()
      .isIn(['newest', 'oldest', 'popular', 'rating'])
      .withMessage('Invalid sort option')
  ]
};
      