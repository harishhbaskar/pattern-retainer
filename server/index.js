import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import learningRoutes from "./routes/learningRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/learnings", learningRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));