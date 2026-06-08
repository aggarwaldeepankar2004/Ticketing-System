import { Router } from 'express';
import { getAnalytics } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/analytics', authenticate, getAnalytics);

export default router;
