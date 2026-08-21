import { Router } from 'express';
import { protect, optionalProtect, requireVoiceApiKey, restrictTo } from '../middleware/auth.middleware.js';
import {
  createOrderValidator,
  createVoiceOrderValidator,
  updateStatusValidator,
  mongoIdValidator,
} from '../validators/order.validator.js';
import {
  createOrder,
  createVoiceOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderTracking,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller.js';

const router = Router();

// ─── Machine-to-machine voice order route does not require JWT ──────────────
router.post('/voice', requireVoiceApiKey, createVoiceOrderValidator, createVoiceOrder);

// ─── All remaining order routes require authentication ───────────────────────
// ─── Customer Routes ──────────────────────────────────────────────────────────
router.post('/',           optionalProtect, createOrderValidator, createOrder);
router.get('/my-orders',   protect, getMyOrders);

router.use(protect);

// ─── Admin Only Routes ────────────────────────────────────────────────────────
router.get('/',            restrictTo('admin'), getAllOrders);
router.get('/:id/tracking',mongoIdValidator,    getOrderTracking);
router.get('/:id',         mongoIdValidator,    getOrderById);
router.patch('/:id/status',updateStatusValidator, restrictTo('admin'), updateOrderStatus);
router.delete('/:id',      mongoIdValidator,    restrictTo('admin'), deleteOrder);

export default router;
