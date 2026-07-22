import * as profileService from '../services/profile.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ─── GET /api/v1/profile ──────────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id);
    sendSuccess(res, 200, 'Profile fetched successfully', profile);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/profile ────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const newAvatarUrl = req.file?.path ?? null; // Cloudinary URL from multer
    const updated = await profileService.updateProfile(req.user._id, req.body, newAvatarUrl);
    sendSuccess(res, 200, 'Profile updated successfully', updated);
  } catch (err) {
    next(err);
  }
};
