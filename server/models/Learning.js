import mongoose from "mongoose";

const LearningSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // <--- ADD THIS
  topic: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  nextReviewDate: Date,
  stage: { type: Number, default: 1 } 
});

const Learning = mongoose.model('Learning', LearningSchema);
export default Learning;