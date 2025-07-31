import mongoose from 'mongoose'

const moodBeforeEnum = ['excited', 'motivated', 'neutral', 'tired', 'stressed', 'anxious'];
const moodAfterEnum = ['energized', 'relaxed', 'accomplished', 'neutral', 'tired', 'frustrated'];

const sessionTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  completed_at: {
    type: Date,
    default: Date.now
  },
  duration_completed: {
    type: Number,
    required: true,
    min: [0, 'Duration completed cannot be negative'] // in minutes
  },
  calories_burned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  mood_before: {
    type: String,
    enum: moodBeforeEnum
  },
  mood_after: {
    type: String,
    enum: moodAfterEnum
  },
  completion_percentage: {
    type: Number,
    min: [0, 'Completion percentage cannot be negative'],
    max: [100, 'Completion percentage cannot exceed 100'],
    default: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for efficient queries and to prevent duplicates
sessionTrackingSchema.index({ user: 1, session: 1, completed_at: 1 }, { unique: true });
sessionTrackingSchema.index({ user: 1, completed_at: -1 });


// Virtual for session details
sessionTrackingSchema.virtual('session_info', {
  ref: 'Session',
  localField: 'session',
  foreignField: '_id',
  justOne: true
});

// Virtual for user details
sessionTrackingSchema.virtual('user_info', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

export const SessionTracking = mongoose.model('SessionTracking', sessionTrackingSchema);
