"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
// Load environment variables
const envPath = path_1.default.resolve(process.cwd(), '.env');
if (fs_1.default.existsSync(envPath)) {
    dotenv_1.default.config({ path: envPath });
    console.log('✅ Environment variables loaded successfully from .env');
}
else {
    console.error('❌ Error: .env file not found at:', envPath);
    console.log('Please create a .env file in the backend directory with the required environment variables');
    process.exit(1);
}
// Initialize Express
const app = (0, express_1.default)();
// Connect to MongoDB
(0, db_1.default)().catch(err => {
    console.error('❌ Failed to connect to MongoDB');
    console.error('Please check your MongoDB connection string in local.env');
    process.exit(1);
});
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS configuration
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Make uploads folder static
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/task', tasks_1.default);
// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
    });
});
// Start server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map