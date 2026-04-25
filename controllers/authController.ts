import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import Otp from "../models/smtp";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
// import bcrypt from "bcryptjs";

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  // Add other token payload properties here if needed
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);
console.log(process.env.OTP_EXPIRES_MINUTES);


export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });

    await Otp.create({
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
  } catch (error) {
    return res.status(500).json({ error });
  }
};



export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, otp } = req.body;

    if (!fullName || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered. Please login." });
    }

    // Get OTP record
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

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
    const user = await User.create({ fullName, email, password, verified: true });

    // Delete used OTP
    await Otp.deleteMany({ email });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

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

  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Return user data without password and with token
    const userData = user.toObject();
    if ('password' in userData) {
      delete (userData as any).password;
    }
    if ('__v' in userData) {
      delete (userData as any).__v;
    }

    res.json({ 
      success: true,
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};


export const getUserInfo = async (req: Request, res: Response) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as CustomJwtPayload;
    console.log('Decoded token:', decoded);
    
    // Find the user by ID from the token
    console.log('Finding user with ID:', decoded.userId);
    const user = await User.findById(decoded.userId).select('-password -__v');
    
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

  } catch (error: unknown) {
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
