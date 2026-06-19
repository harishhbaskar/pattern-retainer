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

const router = express.Router();

router.post("/",protect,createLearning);
router.get("/",protect, getLearnings);
router.put("/:id/review",protect, reviewLearning);
router.get("/stats", protect, getStats);
router.get("/:id", protect, getLearning);
router.put("/:id", protect, updateLearning);
router.delete("/:id", protect, deleteLearning);

export default router;