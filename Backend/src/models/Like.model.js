import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // target_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   refPath: 'target_type'
  // },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate likes
likeSchema.index({ user: 1, session: 1}, { unique: true });

export const Like = mongoose.model('Like', likeSchema);