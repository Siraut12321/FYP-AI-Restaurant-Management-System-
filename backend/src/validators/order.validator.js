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

// ─── Create Order ─────────────────────────────────────────────────────────────
export const createOrderValidator = [
  body('orderItems')
    .isArray({ min: 1 }).withMessage('At least one order item is required'),

  body('orderItems.*.menuItem')
    .notEmpty().withMessage('Menu item ID is required')
    .isMongoId().withMessage('Invalid menu item ID'),

  body('orderItems.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ gt: 0 }).withMessage('Quantity must be greater than zero'),

  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),

  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Full name is required'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),

  body('shippingAddress.address')
    .trim()
    .notEmpty().withMessage('Address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['Cash on Delivery', 'Card', 'Online'])
    .withMessage('Payment method must be Cash on Delivery, Card, or Online'),

  validate,
];

// ─── Update Order Status ──────────────────────────────────────────────────────
export const updateStatusValidator = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  body('orderStatus')
    .notEmpty().withMessage('Order status is required')
    .isIn(['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'])
    .withMessage('Invalid order status'),

  validate,
];

// ─── MongoDB ID param validator ───────────────────────────────────────────────
export const mongoIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  validate,
];
