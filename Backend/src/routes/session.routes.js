import { Router } from 'express';
import { getPublicSessions, getSessionById, getUserSessions, saveDraftSession, publishSession, updateSession, deleteSession, toggleLike, addComment, getComments} from '../controllers/session.controller.js';

import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js';
import { sessionValidation, queryValidation, commentValidation } from '../utils/validators.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';
import { createSessionLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router()

router.get('/', optionalAuth, queryValidation.pagination, queryValidation.sessions, handleValidationErrors, getPublicSessions);

router.get('/:sessionId', optionalAuth, getSessionById)

router.get('/my/all', verifyJWT, queryValidation.pagination, handleValidationErrors, getUserSessions);  // Get user's own sessions

router.post('/save-draft', verifyJWT, createSessionLimiter, sessionValidation.create, handleValidationErrors, saveDraftSession);

router.post( '/publish', verifyJWT, sessionValidation.publish ,publishSession);

router.post( '/update/:sessionId', verifyJWT, sessionValidation.update, handleValidationErrors,  updateSession); 

router.delete( '/delete/:sessionId', verifyJWT, deleteSession);

router.post( '/:sessionId/like', verifyJWT, toggleLike);

router.post( '/:sessionId/comment', verifyJWT, commentValidation.create, handleValidationErrors, addComment);

router.get( '/:sessionId/comments', optionalAuth, queryValidation.pagination, handleValidationErrors, getComments);

export default router;