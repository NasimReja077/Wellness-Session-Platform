import { Router } from 'express';
import {
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
} from '../controllers/user.controller.js';
import { verifyJWT, optionalAuth } from '../middlewares/auth.middleware.js';
import { userValidation, queryValidation } from '../utils/validators.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';

const router = Router();

router.get(
  '/:id',
  optionalAuth,
  userValidation.profile,
  handleValidationErrors,
  getUserProfile
);
router.post(
  '/:id/follow',
  verifyJWT,
  userValidation.follow,
  handleValidationErrors,
  toggleFollow
);
router.get(
  '/:userId/followers',
  optionalAuth,
  userValidation.profile,
  queryValidation.pagination,
  handleValidationErrors,
  getFollowers
);
router.get(
  '/:userId/following',
  optionalAuth,
  userValidation.profile,
  queryValidation.pagination,
  handleValidationErrors,
  getFollowing
);

export default router;