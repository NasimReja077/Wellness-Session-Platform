// Backend/ src/ app.js

import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from 'compression';
import morgan from 'morgan';

import { errorHandler } from './middlewares/error.middleware.js';
import routes from './routes/index.routes.js';

const app = express(); 

app.use(helmet()); // Security middleware

app.use(cors({ // Enable CORS for all origins (frontend URL in production)
     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
     credentials: true
}));


// Body parsers
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));

// Serve static files from "public" directory
app.use(express.static("public"));

app.use(cookieParser()); // Cookie parser

app.use(compression())

// app.use('/api/', rateLimiter);


// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
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