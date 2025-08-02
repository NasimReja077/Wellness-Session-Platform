import { Router } from 'express';
import authRoutes from './auth.routes.js';
import sessionRoutes from './session.routes.js';
import categoryRoutes from './category.routes.js';
import userRoutes from './user.routes.js';
import analyticsRoutes from './analytics.routes.js';
const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/sessions', sessionRoutes);
routes.use('/my-sessions', sessionRoutes);
routes.use('/categories', categoryRoutes);
routes.use('/users', userRoutes)
routes.use('/analytics', analyticsRoutes)
export default routes;

