import { Router } from "express";
import { sendOtp, verifyOtp, login, getUserInfo } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);

// Protected route - requires valid JWT token
router.get("/user", authMiddleware, getUserInfo);


export default router;
