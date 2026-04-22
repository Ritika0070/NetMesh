import express        from "express";
import { register, login, updateProfile, changePassword } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register",         register);
router.post("/login",            login);
router.put("/profile",           authMiddleware, updateProfile);
router.put("/change-password",   authMiddleware, changePassword);

export default router;