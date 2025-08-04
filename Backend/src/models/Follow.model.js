import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follower ID is required'],
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Following ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent self-following
followSchema.pre('save', function (next) {
  if (this.follower.equals(this.following)) {
    const error = new Error('Users cannot follow themselves');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

// Compound index to prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = mongoose.model('Follow', followSchema);