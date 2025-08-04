import { body, param, query } from 'express-validator';

// User validation rules
export const userValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-z0-9_]+$/)
      .withMessage('Username can only contain lowercase letters, numbers, and underscores'),
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
    body('profile.bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio cannot exceed 500 characters'),
    body('profile.location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location cannot exceed 100 characters'),
    body('profile.fitnessGoals')
      .optional()
      .isArray()
      .withMessage('Fitness goals must be an array')
      .custom((value) => {
        if (!value) return true;
        const validGoals = [
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
        return value.every((goal) => validGoals.includes(goal));
      })
      .withMessage('Invalid fitness goals'),
    body('profile.dietaryPreferences')
      .optional()
      .isArray()
      .withMessage('Dietary preferences must be an array')
      .custom((value) => {
        if (!value) return true;
        const validPrefs = [
          'vegetarian',
          'vegan',
          'gluten_free',
          'dairy_free',
          'keto',
          'paleo',
          'mediterranean',
        ];
        return value.every((pref) => validPrefs.includes(pref));
      })
      .withMessage('Invalid dietary preferences'),
    body('profile.experienceLevel')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid experience level'),
    body('profile.age')
      .optional()
      .isInt({ min: 13, max: 150 })
      .withMessage('Age must be between 13 and 150'),
    body('profile.height')
      .optional()
      .isFloat({ min: 50, max: 300 })
      .withMessage('Height must be between 50cm and 300cm'),
    body('profile.weight')
      .optional()
      .isFloat({ min: 15, max: 500 })
      .withMessage('Weight must be between 15kg and 500kg'),
    body('profile.avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
  ],
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  updateProfile: [
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
    body('profile.bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio cannot exceed 500 characters'),
    body('profile.location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location cannot exceed 100 characters'),
    body('profile.fitnessGoals')
      .optional()
      .isArray()
      .withMessage('Fitness goals must be an array')
      .custom((value) => {
        if (!value) return true;
        const validGoals = [
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
        return value.every((goal) => validGoals.includes(goal));
      })
      .withMessage('Invalid fitness goals'),
    body('profile.dietaryPreferences')
      .optional()
      .isArray()
      .withMessage('Dietary preferences must be an array')
      .custom((value) => {
        if (!value) return true;
        const validPrefs = [
          'vegetarian',
          'vegan',
          'gluten_free',
          'dairy_free',
          'keto',
          'paleo',
          'mediterranean',
        ];
        return value.every((pref) => validPrefs.includes(pref));
      })
      .withMessage('Invalid dietary preferences'),
    body('profile.experienceLevel')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid experience level'),
    body('profile.age')
      .optional()
      .isInt({ min: 13, max: 150 })
      .withMessage('Age must be between 13 and 150'),
    body('profile.height')
      .optional()
      .isFloat({ min: 50, max: 300 })
      .withMessage('Height must be between 50cm and 300cm'),
    body('profile.weight')
      .optional()
      .isFloat({ min: 15, max: 500 })
      .withMessage('Weight must be between 15kg and 500kg'),
    body('profile.avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
  ],
  profile: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
  ],
  follow: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
  ],
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
      .withMessage('Category must be a valid MongoDB ID'),
    body('difficulty')
      .notEmpty()
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
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters'),
    body('json_file_url')
      .optional()
      .isURL()
      .withMessage('JSON file URL must be a valid URL'),
    body('content.instructions')
      .optional()
      .isArray()
      .withMessage('Instructions must be an array'),
    body('content.equipment')
      .optional()
      .isArray()
      .withMessage('Equipment must be an array'),
    body('content.calories_burned')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Calories burned cannot be negative'),
    body('content.nutritional_info.calories')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional calories cannot be negative'),
    body('content.nutritional_info.protein')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional protein cannot be negative'),
    body('content.nutritional_info.carbs')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional carbs cannot be negative'),
    body('content.nutritional_info.fat')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional fat cannot be negative'),
    body('content.nutritional_info.fiber')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional fiber cannot be negative'),
    body('content.nutritional_info.sugar')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional sugar cannot be negative'),
    body('content.nutritional_info.sodium')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional sodium cannot be negative'),
    body('content.equipment_needed')
      .optional()
      .isArray()
      .withMessage('Equipment needed must be an array'),
    body('content.target_muscles')
      .optional()
      .isArray()
      .withMessage('Target muscles must be an array')
      .custom((value) => {
        if (!value) return true;
        const validMuscles = ['core', 'legs', 'arms', 'back', 'chest', 'shoulders', 'glutes', 'full_body'];
        return value.every((muscle) => validMuscles.includes(muscle));
      })
      .withMessage('Invalid target muscle'),
    body('privacy')
      .optional()
      .isIn(['public', 'private'])
      .withMessage('Invalid privacy option'),
  ],
  update: [
    param('sessionId')
      .isMongoId()
      .withMessage('Invalid session ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage('Title must be between 3 and 150 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 100000 })
      .withMessage('Description cannot exceed 100000 characters'),
    body('category')
      .optional()
      .isMongoId()
      .withMessage('Category must be a valid MongoDB ID'),
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
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters'),
    body('json_file_url')
      .optional()
      .isURL()
      .withMessage('JSON file URL must be a valid URL'),
    body('content.instructions')
      .optional()
      .isArray()
      .withMessage('Instructions must be an array'),
    body('content.equipment')
      .optional()
      .isArray()
      .withMessage('Equipment must be an array'),
    body('content.calories_burned')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Calories burned cannot be negative'),
    body('content.nutritional_info.calories')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional calories cannot be negative'),
    body('content.nutritional_info.protein')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional protein cannot be negative'),
    body('content.nutritional_info.carbs')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional carbs cannot be negative'),
    body('content.nutritional_info.fat')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional fat cannot be negative'),
    body('content.nutritional_info.fiber')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional fiber cannot be negative'),
    body('content.nutritional_info.sugar')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional sugar cannot be negative'),
    body('content.nutritional_info.sodium')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Nutritional sodium cannot be negative'),
    body('content.equipment_needed')
      .optional()
      .isArray()
      .withMessage('Equipment needed must be an array'),
    body('content.target_muscles')
      .optional()
      .isArray()
      .withMessage('Target muscles must be an array')
      .custom((value) => {
        if (!value) return true;
        const validMuscles = ['core', 'legs', 'arms', 'back', 'chest', 'shoulders', 'glutes', 'full_body'];
        return value.every((muscle) => validMuscles.includes(muscle));
      })
      .withMessage('Invalid target muscle'),
    body('privacy')
      .optional()
      .isIn(['public', 'private'])
      .withMessage('Invalid privacy option'),
  ],
  publish: [
    body('sessionId')
      .isMongoId()
      .withMessage('Invalid session ID'),
  ],
};

// Comment validation rules
export const commentValidation = {
  create: [
    param('sessionId')
      .isMongoId()
      .withMessage('Invalid session ID'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 500 })
      .withMessage('Content must be less than 500 characters'),
    body('parentCommentId')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent comment ID'),
  ],
};

// Progress validation rules
export const sessionTrackingValidation = {
  create: [
    body('sessionId')
      .isMongoId()
      .withMessage('Invalid session ID'),
    body('durationCompleted')
      .isInt({ min: 1 })
      .withMessage('Duration completed must be a positive integer'),
    body('caloriesBurned')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Calories burned must be a non-negative integer'),
  ],
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
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  sessions: [
    query('category')
      .optional()
      .isMongoId()
      .withMessage('Category must be a valid MongoDB ID'),
    query('difficulty')
      .optional({ checkFalsy: true })
      .isIn(['beginner', 'intermediate', 'advanced', ''])
      .withMessage('Invalid difficulty level'),
    query('sort')
      .optional()
      .isIn(['newest', 'oldest', 'popular', 'duration'])
      .withMessage('Invalid sort option'),
    query('search')
      .optional()
      .trim()
      .escape(),
    query('tags')
      .optional()
      .trim(),
    query('minDuration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Minimum duration must be a positive integer'),
    query('maxDuration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Maximum duration must be a positive integer'),
  ],
};