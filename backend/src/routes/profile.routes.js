import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

const router = Router();

// ─── Inline validator for profile update ─────────────────────────────────────
const profileUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('phone').optional().trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Invalid phone number'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  (req, _res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 422));
    next();
  },
];

// ─── All profile routes require authentication ────────────────────────────────
router.use(protect);

router.get('/',   getProfile);
router.patch('/', uploadAvatar, profileUpdateValidator, updateProfile);

export default router;
