import { body, param } from 'express-validator';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

// ─── Reusable validation result handler ───────────────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }
  next();
};

// ─── Create Menu Item ─────────────────────────────────────────────────────────
export const createMenuValidator = [
  body('dishName')
    .trim()
    .notEmpty().withMessage('Dish name is required')
    .isLength({ max: 100 }).withMessage('Dish name cannot exceed 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),

  body('discountPrice')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Discount price cannot be negative'),

  body('ingredients').optional(),
  body('ingredients.*').optional().isString(),
  body('preparationTime')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Preparation time must be a positive integer (minutes)'),

  validate,
];

// ─── Update Menu Item ─────────────────────────────────────────────────────────
export const updateMenuValidator = [
  param('id')
    .isMongoId().withMessage('Invalid menu item ID'),

  body('dishName')
    .optional()
    .trim()
    .notEmpty().withMessage('Dish name cannot be empty')
    .isLength({ max: 100 }).withMessage('Dish name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty'),

  body('price')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),

  body('discountPrice')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Discount price cannot be negative'),

  body('ingredients').optional(),
  body('ingredients.*').optional().isString(),

  body('preparationTime')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Preparation time must be a positive integer (minutes)'),

  validate,
];

// ─── MongoDB ID param validator (shared) ──────────────────────────────────────
export const mongoIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid menu item ID'),

  validate,
];
