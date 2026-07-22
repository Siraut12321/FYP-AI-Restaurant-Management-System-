import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  createOrderValidator,
  updateStatusValidator,
  mongoIdValidator,
} from '../validators/order.validator.js';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller.js';

const router = Router();

// ─── All order routes require authentication ──────────────────────────────────
router.use(protect);

// ─── Customer Routes ──────────────────────────────────────────────────────────
router.post('/',           createOrderValidator, createOrder);
router.get('/my-orders',   getMyOrders);

// ─── Admin Only Routes ────────────────────────────────────────────────────────
router.get('/',            restrictTo('admin'), getAllOrders);
router.get('/:id',         mongoIdValidator,    getOrderById);
router.patch('/:id/status',updateStatusValidator, restrictTo('admin'), updateOrderStatus);
router.delete('/:id',      mongoIdValidator,    restrictTo('admin'), deleteOrder);

export default router;
