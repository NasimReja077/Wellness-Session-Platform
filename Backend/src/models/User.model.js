import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Enums for clarity and maintainability
const fitnessGoalsEnum = [
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

const dietaryPreferencesEnum = [
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
  'keto',
  'paleo',
  'mediterranean',
];

const experienceLevels = ['beginner', 'intermediate', 'advanced'];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    profile: {
      firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters'],
      },
      avatar: {
        type: String,
        default: 'https://res.cloudinary.com/wellness-platform/image/upload/v1/default-avatar.jpg',
      },
      bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
      },
      age: {
        type: Number,
        min: [13, 'Must be at least 13 years old'],
        max: [150, 'Invalid age'],
      },
      height: {
        type: Number,
        min: [50, 'Height must be at least 50cm'],
        max: [300, 'Height cannot exceed 300cm'],
      },
      weight: {
        type: Number,
        min: [15, 'Weight must be at least 15kg'],
        max: [500, 'Weight cannot exceed 500kg'],
      },
      location: {
        type: String,
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters'],
        default: '',
      },
      fitnessGoals: [
        {
          type: String,
          enum: fitnessGoalsEnum,
        },
      ],
      dietaryPreferences: [
        {
          type: String,
          enum: dietaryPreferencesEnum,
        },
      ],
      experienceLevel: {
        type: String,
        enum: experienceLevels,
        default: 'beginner',
      },
    },
    stats: {
      total_sessions: { type: Number, default: 0 },
      total_minutes: { type: Number, default: 0 },
      streak_days: { type: Number, default: 0 },
      last_session: { type: Date, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'profile.fitnessGoals': 1 });
userSchema.index({ createdAt: -1 });

// Virtual fields
userSchema.virtual('followersCount', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'following',
  count: true,
});

userSchema.virtual('followingCount', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'follower',
  count: true,
});

userSchema.virtual('followers', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'following',
  justOne: false,
  options: { select: 'follower' },
});

userSchema.virtual('following', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'follower',
  justOne: false,
  options: { select: 'following' },
});

userSchema.virtual('fullName').get(function () {
  const firstName = this.profile?.firstName || '';
  const lastName = this.profile?.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Pre-save: hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWT token generator
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Remove sensitive fields for profile
userSchema.methods.getProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

export const User = mongoose.model('User', userSchema);