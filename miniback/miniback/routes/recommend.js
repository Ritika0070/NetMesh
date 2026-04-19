import express from "express";
import { getRecommendations } from "../controllers/recommendController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", authMiddleware, getRecommendations);
export default router;
