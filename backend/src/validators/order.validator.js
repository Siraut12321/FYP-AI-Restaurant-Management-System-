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

  body('shippingAddress.email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(/^(?:[a-zA-Z0-9._%+-]+@gmail\.com|admin@restaurant\.com)$/)
    .withMessage('Please enter a valid Gmail address or the admin email.'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^03[0-9]{9}$/).withMessage('Phone must be 11 digits starting with 03 (e.g. 03001234567)'),

  body('shippingAddress.address')
    .trim()
    .notEmpty().withMessage('Address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .equals('Cash on Delivery').withMessage('Payment method must be Cash on Delivery'),

  validate,
];

export const createVoiceOrderValidator = [
  // Accept a server-side user identifier when provided by trusted voice systems
  body('userId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid userId'),

  body('customer')
    .optional({ nullable: true })
    .isObject().withMessage('Customer must be an object when provided'),

  body('customer.name')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('Customer name is required when customer is provided'),

  body('customer.phone')
    .optional({ nullable: true })
    .trim()
    .notEmpty().withMessage('Customer phone is required when customer is provided'),

  body('shippingAddress')
    .notEmpty().withMessage('Shipping address is required'),

  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Full name is required'),

  body('shippingAddress.email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(/^(?:[a-zA-Z0-9._%+-]+@gmail\.com|admin@restaurant\.com)$/)
    .withMessage('Please enter a valid Gmail address or the admin email.'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^03[0-9]{9}$/).withMessage('Phone must be 11 digits starting with 03 (e.g. 03001234567)'),

  body('shippingAddress.address')
    .trim()
    .notEmpty().withMessage('Address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('orderItems')
    .isArray({ min: 1 }).withMessage('At least one order item is required'),

  body('orderItems.*.menuItem')
    .notEmpty().withMessage('Menu item ID is required')
    .isMongoId().withMessage('Invalid menu item ID'),

  body('orderItems.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ gt: 0 }).withMessage('Quantity must be greater than zero'),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .equals('Cash on Delivery').withMessage('Payment method must be Cash on Delivery'),

  body('price').not().exists().withMessage('price is not allowed'),
  body('subtotal').not().exists().withMessage('subtotal is not allowed'),
  body('totalAmount').not().exists().withMessage('totalAmount is not allowed'),
  body('dishName').not().exists().withMessage('dishName is not allowed'),
  body('orderStatus').not().exists().withMessage('orderStatus is not allowed'),
  body('paymentStatus').not().exists().withMessage('paymentStatus is not allowed'),
  body('orderSource').not().exists().withMessage('orderSource is not allowed'),

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
