import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { sendWelcomeEmail } from './email.service.js';

// ─── Generate JWT ──────────────────────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// ─── Strip sensitive fields for response ──────────────────────────────────────
const sanitizeUser = (user) => ({
  _id:       user._id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  avatar:    user.avatar,
  createdAt: user.createdAt,
});

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email is already registered', 409);

  const user = await User.create({ name, email, password, role });

  try {
    await sendWelcomeEmail(user);
  } catch (error) {
    console.error('Welcome email failed:', error);
  }

  const token = generateToken(user._id);

  return { user: sanitizeUser(user), token };
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  console.log('LOGIN ATTEMPT → email:', email, '| password length:', password?.length);
  const user = await User.findOne({ email }).select('+password');
  console.log('USER FOUND:', !!user);
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await user.comparePassword(password);
  console.log('PASSWORD MATCH:', isMatch);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const token = generateToken(user._id);

  return { user: sanitizeUser(user), token };
};
