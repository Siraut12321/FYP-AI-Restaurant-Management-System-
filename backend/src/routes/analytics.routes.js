import { Router }       from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { getDashboard }        from '../controllers/analytics.controller.js';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboard);

export default router;
