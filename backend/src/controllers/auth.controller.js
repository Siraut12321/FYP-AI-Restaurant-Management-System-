import { validationResult } from 'express-validator';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';

// ─── Cookie options ────────────────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000, // days → ms
};

// ─── Helper: attach token to cookie + response ────────────────────────────────
const sendTokenResponse = (res, statusCode, message, user, token) => {
  res.cookie('token', token, cookieOptions);
  sendSuccess(res, statusCode, message, { user, token });
};

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 422, errors.array()));
    }

    const { user, token } = await registerUser(req.body);
    sendTokenResponse(res, 201, 'Registration successful', user, token);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 422, errors.array()));
    }

    const { user, token } = await loginUser(req.body);
    sendTokenResponse(res, 200, 'Login successful', user, token);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────
export const logout = (_req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  sendSuccess(res, 200, 'Logged out successfully');
};

// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────
export const getMe = (req, res) => {
  sendSuccess(res, 200, 'User fetched successfully', { user: req.user });
};

// ─── POST /api/v1/auth/forgot-password ───────────────────────────────────────
export const forgotPasswordHandler = async (req, res, next) => {
  try {
    await forgotPassword(req.body.email);
    sendSuccess(res, 200, 'Password reset code sent to your email');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/auth/reset-password ────────────────────────────────────────
export const resetPasswordHandler = async (req, res, next) => {
  try {
    await resetPassword(req.body.resetCode, req.body.newPassword);
    sendSuccess(res, 200, 'Password reset successful');
  } catch (err) {
    next(err);
  }
};
