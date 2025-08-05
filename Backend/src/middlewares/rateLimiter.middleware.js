import rateLimit from 'express-rate-limit';

// Helper function for consistent error responses
const createRateLimitError = (message, retryAfter) => ({
  success: false,
  message,
  retryAfter,
});

// Auth rate limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: async (req) => createRateLimitError(
    'Too many authentication attempts, please try again later.',
    Math.round(req.rateLimit.resetTime / 1000)
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: async (req) => createRateLimitError(
    'Too many requests from this IP, please try again later.',
    Math.round(req.rateLimit.resetTime / 1000)
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// Session creation rate limiter
export const createSessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: async (req) => createRateLimitError(
    'Too many session creation requests, please try again later.',
    Math.round(req.rateLimit.resetTime / 1000)
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

