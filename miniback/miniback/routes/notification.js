import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getNotifications, markNotificationsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.post("/read", authMiddleware, markNotificationsRead);

export default router;
