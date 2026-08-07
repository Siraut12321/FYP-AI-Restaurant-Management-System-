import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

const maxTextLength = Number(process.env.OPENAI_TTS_MAX_TEXT_LENGTH || 1000);

// ─── Reusable validation result handler ───────────────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }
  next();
};

// ─── TTS Request Validator ────────────────────────────────────────────────────
export const ttsValidator = [
  body('text')
    .exists().withMessage('Text is required')
    .isString().withMessage('Text must be a string')
    .trim()
    .notEmpty().withMessage('Text cannot be empty')
    .isLength({ max: maxTextLength }).withMessage(`Text cannot exceed ${maxTextLength} characters`),

  body('language')
    .exists().withMessage('Language is required')
    .isIn(['en', 'ur']).withMessage('Language must be either "en" or "ur"'),

  validate,
];
