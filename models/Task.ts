import mongoose, { Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  dueDate: Date | null;
  userId: mongoose.Types.ObjectId;
}

const taskSchema = new mongoose.Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    dueDate: { type: Date, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("Task", taskSchema);
