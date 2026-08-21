import { body } from 'express-validator';

const AUTH_EMAIL_RE = /^(?:[a-zA-Z0-9._%+-]+@gmail\.com|admin@restaurant\.com)$/;
const AUTH_EMAIL_MSG = 'Please enter a valid Gmail address or the admin email.';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(AUTH_EMAIL_RE).withMessage(AUTH_EMAIL_MSG),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 9, max: 12 }).withMessage('Password must be between 9 and 12 characters.'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(AUTH_EMAIL_RE).withMessage(AUTH_EMAIL_MSG),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 9, max: 12 }).withMessage('Password must be between 9 and 12 characters.'),
];
