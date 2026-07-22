import User from '../models/User.js';
import Order from '../models/Order.js';
import cloudinary from '../config/cloudinaryConfig.js';
import AppError from '../utils/AppError.js';

// ─── Extract Cloudinary public_id from URL ────────────────────────────────────
const extractPublicId = (url) => {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  const relevantParts = parts.slice(uploadIndex + 2);
  const last = relevantParts[relevantParts.length - 1].split('.')[0];
  relevantParts[relevantParts.length - 1] = last;
  return relevantParts.join('/');
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
export const getProfile = async (userId) => {
  const [user, totalOrders] = await Promise.all([
    User.findById(userId).select('name email role avatar phone address createdAt updatedAt'),
    Order.countDocuments({ customer: userId }),
  ]);

  if (!user) throw new AppError('User not found', 404);

  return { ...user.toObject(), totalOrders };
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (userId, data, newAvatarUrl) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  // Delete old avatar from Cloudinary if a new one is uploaded
  if (newAvatarUrl && user.avatar) {
    try {
      await cloudinary.uploader.destroy(extractPublicId(user.avatar));
    } catch {
      // Non-blocking
    }
  }

  const allowed = ['name', 'phone', 'address'];
  allowed.forEach((field) => {
    if (data[field] !== undefined) user[field] = data[field];
  });

  if (newAvatarUrl) user.avatar = newAvatarUrl;

  await user.save();

  const updated = user.toObject();
  delete updated.password;
  return updated;
};
