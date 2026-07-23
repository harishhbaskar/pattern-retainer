import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learning: { type: mongoose.Schema.Types.ObjectId, ref: 'Learning', required: true },
  difficulty: {
    type: String,
    required: true,
    enum: ['hard', 'good', 'easy']
  },
  stageBefore: { type: Number, required: true },
  stageAfter: { type: Number, required: true },
  reviewedAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ user: 1, reviewedAt: -1 });
ReviewSchema.index({ learning: 1, reviewedAt: -1 });

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
