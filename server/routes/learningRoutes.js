import express from "express";
import { 
  createLearning, 
  getLearnings, 
  reviewLearning,
  deleteLearning,
  getLearning,
  updateLearning,
  getStats
} from "../controllers/learningController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { 
  createLearningSchema, 
  updateLearningSchema, 
  reviewLearningSchema 
} from "../validators/learningValidator.js";

const router = express.Router();

router.post("/", protect, validateRequest(createLearningSchema), createLearning);
router.get("/", protect, getLearnings);
router.put("/:id/review", protect, validateRequest(reviewLearningSchema), reviewLearning);
router.get("/stats", protect, getStats);
router.get("/:id", protect, getLearning);
router.put("/:id", protect, validateRequest(updateLearningSchema), updateLearning);
router.delete("/:id", protect, deleteLearning);

export default router;