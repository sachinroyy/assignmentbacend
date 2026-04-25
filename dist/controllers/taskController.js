"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        if (!title)
            return res.status(400).json({ success: false, message: "Title is required" });
        const task = await Task_1.default.create({
            title,
            description: description || "",
            priority: priority || "Medium",
            status: "Pending",
            dueDate: dueDate || null,
            userId: req.user._id,
        });
        return res.status(201).json({ success: true, task });
    }
    catch (error) {
        console.error("Create task error:", error);
        return res.status(500).json({ success: false, message: "Failed to create task" });
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find({ userId: req.user._id }).sort({ createdAt: -1 });
        return res.json({ success: true, tasks });
    }
    catch (error) {
        console.error("Get tasks error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch tasks" });
    }
};
exports.getTasks = getTasks;
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const task = await Task_1.default.findOne({ _id: id, userId: req.user._id });
        if (!task)
            return res.status(404).json({ success: false, message: "Task not found" });
        Object.assign(task, updates);
        await task.save();
        return res.json({ success: true, task });
    }
    catch (error) {
        console.error("Update task error:", error);
        return res.status(500).json({ success: false, message: "Failed to update task" });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task_1.default.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!task)
            return res.status(404).json({ success: false, message: "Task not found" });
        return res.json({ success: true, message: "Task deleted" });
    }
    catch (error) {
        console.error("Delete task error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete task" });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=taskController.js.map