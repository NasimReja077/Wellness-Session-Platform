import { Router } from 'express';
import { toggleFollow, getFollowers, getFollowing } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { queryValidation } from '../utils/validators.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';

const router = Router();

// Middleware to reject body for toggleFollow (optional, safe version)
const rejectBody = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return res.status(400).json(new ApiResponse(400, null, 'Body not allowed for this endpoint', false));
  }
  next();
};

router.post('/:id/follow', verifyJWT, rejectBody, toggleFollow);
router.get('/:userId/followers', queryValidation.pagination, handleValidationErrors, getFollowers);
router.get('/:userId/following', queryValidation.pagination, handleValidationErrors, getFollowing);

export default router;