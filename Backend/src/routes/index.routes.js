import { Router } from 'express';
import authRoutes from './auth.routes.js';
import router from './auth.routes.js';


const routes = Router()

router.use('/auth', authRoutes);

export default router

