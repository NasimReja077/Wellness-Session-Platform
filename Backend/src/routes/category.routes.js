import { Router } from 'express'
import {
  getAllCategories,
  createCategory
//   getPersonalizedSuggestions
} from '../controllers/category.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// Public routes
router.get('/', getAllCategories)
router.post('/', verifyJWT, createCategory); // route for creating categories

// Protected routes
// router.get('/suggestions', verifyJWT, getPersonalizedSuggestions)

export default router