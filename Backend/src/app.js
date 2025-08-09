// Backend/ src/ app.js

import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from 'compression';
import morgan from 'morgan';

import { errorHandler } from './middlewares/error.middleware.js';
import routes from './routes/index.routes.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js'
const app = express(); 

app.use(helmet()); // Security middleware

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:5174',
      'https://your-frontend-domain.onrender.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsers
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));

// Serve static files from "public" directory
// app.use(express.static("public"));

app.use(cookieParser()); // Cookie parser

app.use(compression())

app.use('/api/', apiLimiter);


// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Add proper static file handling
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static('uploads'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Wellness Platform API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api', routes)

// Global error handler
app.use(errorHandler);

export { app };