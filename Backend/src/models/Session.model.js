import mongoose from 'mongoose'

// Enum options
const difficulties = ['beginner', 'intermediate', 'advanced'];
const privacyOptions = ['public', 'private'];
const statusOptions = ['draft', 'published'];
const targetMuscles = ['core', 'legs', 'arms', 'back', 'chest', 'shoulders', 'glutes', 'full_body'];


const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [100000, 'description cannot exceed 100000 characters'],
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  difficulty: {
    type: String,
    required: true,
    enum: difficulties,
    default: 'beginner'
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [300, 'Duration cannot exceed 300 minutes']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  json_file_url: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Session creator is required']
  },

  content: {
    instructions: [{
      type: String,
      trim: true
    }],
    equipment: [{
      type: String,
      trim: true
    }],
    calories_burned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative'],
    default: 0
  },
  nutritional_info: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  equipment_needed: [{
    type: String,
    trim: true
  }],
  target_muscles: [{
      type: String,
      enum: targetMuscles
    }]
  },
  status: {
    type: String,
    enum: statusOptions,
    default: 'draft'
  },
  privacy: {
    type: String,
    enum: privacyOptions,
    default: 'public'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  engagement: {
    views: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Like',
    }],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      }
    ],
    likes_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 },
    shares_count: { type: Number, default: 0 },
    views_count: { type: Number, default: 0 },
    completions_count: { type: Number, default: 0 },
  },
  published_at: {
    type: Date,
    default: null
  },
  thumbnail: {
    type: String,
    default: 'https://res.cloudinary.com/wellness-platform/image/upload/v1/default-session.jpg'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for better query performance
sessionSchema.index({ title: 'text', tags: 1 });
sessionSchema.index({ 'content.target_muscles': 1 });
sessionSchema.index({ createdBy: 1, status: 1 })
sessionSchema.index({ category: 1, status: 1 })
sessionSchema.index({ tags: 1 })
sessionSchema.index({ createdAt: -1 })
sessionSchema.index({ difficulty: 1 });
sessionSchema.index({ views_count: -1 });


// Virtual fields
sessionSchema.virtual('author', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated category
sessionSchema.virtual('category_details', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

// Check if session is published
sessionSchema.virtual('isPublished').get(function () {
  return this.status === 'published';
});


// Pre-save middleware
// Normalize tags before saving
sessionSchema.pre('save', function (next) {
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = this.tags.map((tag) => tag.toLowerCase().trim());
  }
  next();
});

// Method to increment view count
// Increment views instance method
sessionSchema.methods.incrementViews = function () {
  this.engagement.views++;
  return this.save();
};


export const Session = mongoose.model('Session', sessionSchema);