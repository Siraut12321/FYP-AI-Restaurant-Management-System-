import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { param } from 'express-validator';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';
import {
  addFavorite,
  getFavorites,
  removeFavorite,
  checkFavorite,
} from '../controllers/favorites.controller.js';

const router = Router();

// ─── Validate MongoDB ObjectId param ─────────────────────────────────────────
const menuIdValidator = [
  param('menuId').isMongoId().withMessage('Invalid menu item ID'),
  (req, _res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 422));
    next();
  },
];

// ─── All favorites routes require authentication ──────────────────────────────
router.use(protect);

router.get('/',                          getFavorites);
router.post('/:menuId',   menuIdValidator, addFavorite);
router.delete('/:menuId', menuIdValidator, removeFavorite);
router.get('/:menuId/check', menuIdValidator, checkFavorite);

export default router;
