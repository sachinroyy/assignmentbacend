"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post("/send-otp", authController_1.sendOtp);
router.post("/verify-otp", authController_1.verifyOtp);
router.post("/login", authController_1.login);
// Protected route - requires valid JWT token
router.get("/user", auth_middleware_1.authMiddleware, authController_1.getUserInfo);
exports.default = router;
//# sourceMappingURL=auth.js.map