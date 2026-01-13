import express from "express";
import { 
  createLearning, 
  getLearnings, 
  reviewLearning 
} from "../controllers/learningController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/",protect,createLearning);
router.get("/",protect, getLearnings);
router.put("/:id/review",protect, reviewLearning);

export default router;