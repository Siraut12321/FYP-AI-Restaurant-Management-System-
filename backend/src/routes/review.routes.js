import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.middleware.js';
import AppError from '../utils/AppError.js';
import {
  createReview,
  getReviewsByMenuItem,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';

const router = Router();

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 422));
  next();
};

const menuItemIdValidator = [
  param('menuItemId').isMongoId().withMessage('Invalid menu item ID'),
  validate,
];

const reviewIdValidator = [
  param('id').isMongoId().withMessage('Invalid review ID'),
  validate,
];

const reviewFields = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer from 1 to 5'),
  body('comment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];

const createReviewValidator = [
  body('menuItem').isMongoId().withMessage('Invalid menu item ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer from 1 to 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  validate,
];

const updateReviewValidator = [
  ...reviewFields,
  (req, _res, next) => {
    if (req.body.rating === undefined && req.body.comment === undefined) {
      return next(new AppError('Provide a rating or comment to update', 422));
    }
    next();
  },
  validate,
];

router.get('/:menuItemId', menuItemIdValidator, getReviewsByMenuItem);

router.use(protect);

router.post('/', createReviewValidator, createReview);
router.patch('/:id', reviewIdValidator, updateReviewValidator, updateReview);
router.delete('/:id', reviewIdValidator, deleteReview);

export default router;
