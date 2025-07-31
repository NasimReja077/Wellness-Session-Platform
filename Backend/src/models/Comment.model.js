import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  parent_comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ session: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parent_comment: 1 });

// Virtuals
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent_comment'
});

commentSchema.virtual('author', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

commentSchema.virtual('isReply').get(function () {
  return !!this.parent_comment;
});


export const Comment = mongoose.model('Comment', commentSchema);
