import mongoose, { Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const otpSchema = new mongoose.Schema<IOtp>({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true }); // <-- ADD THIS

export default mongoose.model<IOtp>("Otp", otpSchema);