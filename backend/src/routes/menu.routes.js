import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  createMenuValidator,
  updateMenuValidator,
  mongoIdValidator,
} from '../validators/menu.validator.js';
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  toggleFeatured,
  getCategories,
} from '../controllers/menu.controller.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/',           getAllMenuItems);
router.get('/categories', getCategories);
router.get('/:id',        mongoIdValidator, getMenuItemById);

// ─── Admin Only Routes ────────────────────────────────────────────────────────
router.use(protect, restrictTo('admin'));

router.post(
  '/',
  upload.single('image'),
  createMenuValidator,
  createMenuItem
);

router.patch(
  '/:id',
  upload.single('image'),
  updateMenuValidator,
  updateMenuItem
);

router.delete('/:id',                    mongoIdValidator,  deleteMenuItem);
router.patch('/:id/toggle-availability', mongoIdValidator,  toggleAvailability);
router.patch('/:id/toggle-featured',     mongoIdValidator,  toggleFeatured);

export default router;
