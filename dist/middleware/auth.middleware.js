"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Get user from the token
        const user = await User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        // Add user to request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};
exports.authMiddleware = authMiddleware;
const adminOnly = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        // Verify token and check if user is admin
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        // Check if user is admin
        if (user.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        // Add user to request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};
exports.adminOnly = adminOnly;
exports.default = exports.authMiddleware;
//# sourceMappingURL=auth.middleware.js.map