// Backend/ src/ app.js

import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

const app = express(); 

app.use(helmet()); // Security middleware

app.use(cors({ // Enable CORS for all origins (frontend URL in production)
     origin: process.env.CORS_ORIGIN,
     credentials: true
}));


// Body parsers
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}));

// Serve static files from "public" directory
app.use(express.static("public"));

app.use(cookieParser()); // Cookie parser


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Wellness Platform API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export { app }