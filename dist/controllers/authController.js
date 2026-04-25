"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = exports.login = exports.verifyOtp = exports.sendOtp = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const smtp_1 = __importDefault(require("../models/smtp"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// import bcrypt from "bcryptjs";
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);
console.log(process.env.OTP_EXPIRES_MINUTES);
const sendOtp = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const exists = await User_1.default.findOne({ email });
        if (exists)
            return res.status(400).json({ message: "Email already registered" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await smtp_1.default.deleteMany({ email });
        await smtp_1.default.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRES_MINUTES) * 60000)
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}`
        });
        return res.json({ message: "OTP sent" });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    try {
        const { fullName, email, password, otp } = req.body;
        if (!fullName || !email || !password || !otp) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered. Please login." });
        }
        // Get OTP record
        const otpRecord = await smtp_1.default.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP expired or not found." });
        }
        // Check OTP match
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }
        // Check expiration
        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired." });
        }
        // Create user
        const user = await User_1.default.create({ fullName, email, password, verified: true });
        // Delete used OTP
        await smtp_1.default.deleteMany({ email });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1d" });
        return res.json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                verified: user.verified
            }
        });
    }
    catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};
exports.verifyOtp = verifyOtp;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user || !(await user.comparePassword(password)))
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
        // Return user data without password and with token
        const userData = user.toObject();
        if ('password' in userData) {
            delete userData.password;
        }
        if ('__v' in userData) {
            delete userData.__v;
        }
        res.json({
            success: true,
            message: "Login successful",
            token,
            user: userData
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};
exports.login = login;
const getUserInfo = async (req, res) => {
    console.log('=== GET /api/auth/user called ===');
    console.log('Headers:', req.headers);
    try {
        // Get token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Token from header:', token ? 'Token present' : 'No token found');
        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({
                success: false,
                message: "No authentication token provided"
            });
        }
        // Verify the token
        console.log('Verifying token...');
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Decoded token:', decoded);
        // Find the user by ID from the token
        console.log('Finding user with ID:', decoded.userId);
        const user = await User_1.default.findById(decoded.userId).select('-password -__v');
        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        console.log('User found:', {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            verified: user.verified
        });
        return res.json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                verified: user.verified
            }
        });
    }
    catch (error) {
        // Handle different types of errors
        if (error instanceof Error) {
            console.error("Error in getUserInfo:", {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token"
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Token expired"
                });
            }
            // For other Error types, return a 500 with the error message
            return res.status(500).json({
                success: false,
                message: error.message || 'An error occurred while fetching user information'
            });
        }
        // For non-Error types, return a generic error
        console.error("An unknown error occurred in getUserInfo:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user information"
        });
    }
};
exports.getUserInfo = getUserInfo;
//# sourceMappingURL=authController.js.map