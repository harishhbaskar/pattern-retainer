import mongoose from "mongoose";

const LearningSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  nextReviewDate: { type: Date, required: true },
  stage: { type: Number, default: 1 },
  lastReviewedAt: { type: Date }
});

const Learning = mongoose.model('Learning', LearningSchema);
export default Learning;