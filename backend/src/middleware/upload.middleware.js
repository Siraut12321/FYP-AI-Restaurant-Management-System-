import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary-v2';
import cloudinary from '../config/cloudinaryConfig.js';

// ─── File Filter (shared) ─────────────────────────────────────────────────────
const imageFileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
  }
};

// ─── Menu Image Storage ───────────────────────────────────────────────────────
const menuStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'restaurant/menu',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
  },
});

export const upload = multer({
  storage: menuStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─── Avatar Storage ───────────────────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'restaurant/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max for avatars
}).single('avatar');
