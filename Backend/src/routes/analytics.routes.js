import { Router } from "express";
import { getDashboardAnalytics, completeSession, getSessionAnalytics } from '../controllers/analytics.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { sessionTrackingValidation } from '../utils/validators.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

// Get user dashboard analytics (protected route)
router.get('/dashboard', verifyJWT, authLimiter, getDashboardAnalytics);

// Mark session as completed (protected with validation)
router.post('/complete', verifyJWT, authLimiter, sessionTrackingValidation.create, handleValidationErrors, completeSession);

// Get session analytics for session owner (protected route)
router.get('/analytics/:sessionId', verifyJWT, authLimiter, getSessionAnalytics);

export default router;