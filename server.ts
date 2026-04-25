
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import express, { Application } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';





// Load environment variables
const envPath = path.resolve(process.cwd(),'.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Environment variables loaded successfully from .env');
} else {
  console.error('❌ Error: .env file not found at:', envPath);
  console.log('Please create a .env file in the backend directory with the required environment variables');
  process.exit(1);
}

// Initialize Express
const app: Application = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('❌ Failed to connect to MongoDB');
  console.error('Please check your MongoDB connection string in local.env');
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Make uploads folder static



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/task', taskRoutes);



// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});


// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app;