import { body } from 'express-validator';

const GMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const GMAIL_MSG = 'Please enter a valid Gmail address ending with @gmail.com.';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(GMAIL_RE).withMessage(GMAIL_MSG),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 9, max: 12 }).withMessage('Password must be between 9 and 12 characters.'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .matches(GMAIL_RE).withMessage(GMAIL_MSG),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 9, max: 12 }).withMessage('Password must be between 9 and 12 characters.'),
];
