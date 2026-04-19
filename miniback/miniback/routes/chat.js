import express from "express";
import { sendMessage, getMessages, connectWithUser, respondToConnectionRequest } from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/connect", authMiddleware, connectWithUser);
router.post("/connect/respond", authMiddleware, respondToConnectionRequest);
router.post("/send", authMiddleware, sendMessage);
router.get("/messages", authMiddleware, getMessages);
export default router;
