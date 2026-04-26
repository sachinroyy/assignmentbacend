import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://frontendassignments.netlify.app', 'https://assignmentbacend.onrender.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};
