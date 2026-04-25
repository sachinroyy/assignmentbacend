"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MongoDB connection string is not defined');
        }
        const conn = await mongoose_1.default.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map