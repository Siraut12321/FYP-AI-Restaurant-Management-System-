import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { getAdminCustomers } from '../controllers/admin.customers.controller.js';
import { getAdminReviews } from '../controllers/admin.reviews.controller.js';
import { getAdminConversations } from '../controllers/admin.conversations.controller.js';

const router = Router();

// ─── All admin routes require authentication and admin role ──────────────────
router.use(protect);
router.use(restrictTo('admin'));

// ─── Admin Customers endpoint ──────────────────────────────────────────────
router.get('/customers', getAdminCustomers);

// ─── Admin Reviews endpoint ────────────────────────────────────────────────
router.get('/reviews', getAdminReviews);

// ─── Admin Conversation History endpoint ────────────────────────────────────
router.get('/conversations', getAdminConversations);

export default router;
