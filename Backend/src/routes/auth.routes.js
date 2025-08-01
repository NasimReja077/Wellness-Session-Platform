import { Router } from "express";

import {registerUser, loginUser, logoutUser, getCurrentUser, updateUserProfile} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { userValidation } from '../utils/validators.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = Router()

router.post('/register', authLimiter, handleValidationErrors, userValidation.register, registerUser);
router.post('/login', authLimiter, userValidation.login, handleValidationErrors, loginUser);

router.post('/logout', verifyJWT, logoutUser);
router.post('/currentUserProfile', verifyJWT, getCurrentUser);
router.put('/updateProfile', verifyJWT, updateUserProfile);

export default router;