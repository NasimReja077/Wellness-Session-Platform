import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
   name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [50, 'Category name cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9 _-]+$/, 'Category name can only contain letters, numbers, spaces, underscores, and hyphens']
  },
   description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
    default: ''
  },
  icon: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for fast lookup and uniqueness
categorySchema.index({ name: 1 }, { unique: true });


export const Category = mongoose.model('Category', categorySchema);