import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, _res, next) => {
  try {
    // ─── Extract token from cookie or Authorization header ───────────────────
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(new AppError('Not authenticated. Please log in.', 401));

    // ─── Verify token ─────────────────────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ─── Attach user to request ───────────────────────────────────────────────
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User no longer exists.', 401));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError')  return next(new AppError('Invalid token.', 401));
    if (err.name === 'TokenExpiredError')  return next(new AppError('Token expired. Please log in again.', 401));
    next(err);
  }
};

// ─── Role-based access control ────────────────────────────────────────────────
export const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};
