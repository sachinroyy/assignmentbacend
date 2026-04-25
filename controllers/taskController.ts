import { Request, Response } from "express";
import Task from "../models/Task";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const task = await Task.create({
      title,
      description: description || "",
      priority: priority || "Medium",
      status: "Pending",
      dueDate: dueDate || null,
      userId: req.user._id,
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    Object.assign(task, updates);
    await task.save();

    return res.json({ success: true, task });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    return res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};
