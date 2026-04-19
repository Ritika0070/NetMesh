import express from "express";
import { createSession, joinSession } from "../controllers/sessionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/create", authMiddleware, createSession);
router.post("/join", authMiddleware, joinSession);
export default router;
