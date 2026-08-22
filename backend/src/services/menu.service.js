import MenuItem from '../models/MenuItem.js';
import cloudinary from '../config/cloudinaryConfig.js';
import AppError from '../utils/AppError.js';
import { categoryKey, categoryRankExpression, CATEGORY_ORDER } from '../utils/menuOrdering.js';

const nextDisplayOrder = async (category, excludeId = null) => {
  const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = { category: new RegExp(`^${escapedCategory}$`, 'i') };
  if (excludeId) filter._id = { $ne: excludeId };
  const lastItem = await MenuItem.findOne(filter).sort({ displayOrder: -1 }).select('displayOrder').lean();
  return (lastItem?.displayOrder || 0) + 1;
};

// ─── Extract Cloudinary public_id from URL ────────────────────────────────────
const extractPublicId = (url) => {
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/folder/public_id.ext
  const parts = url.split('/');
  const fileWithExt = parts[parts.length - 1];
  const fileName = fileWithExt.split('.')[0];
  // include folder prefix if present (everything after "upload/vXXX/")
  const uploadIndex = parts.indexOf('upload');
  const relevantParts = parts.slice(uploadIndex + 2); // skip "upload" and version segment
  relevantParts[relevantParts.length - 1] = fileName;
  return relevantParts.join('/');
};

// ─── Delete image from Cloudinary ─────────────────────────────────────────────
const deleteCloudinaryImage = async (imageUrl) => {
  try {
    const publicId = extractPublicId(imageUrl);
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-blocking — log silently, don't fail the main operation
  }
};

// ─── Create Menu Item ─────────────────────────────────────────────────────────
export const createMenuItem = async (data) => {
  const itemData = { ...data };
  if (!itemData.displayOrder) itemData.displayOrder = await nextDisplayOrder(itemData.category);
  const item = await MenuItem.create(itemData);
  return item;
};

// ─── Get All Menu Items ───────────────────────────────────────────────────────
export const getAllMenuItems = async (query = {}) => {
  const filter = {};

  if (query.category) filter.category = new RegExp(query.category, 'i');
  if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable === 'true';
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === 'true';

  const items = await MenuItem.aggregate([
    { $match: filter },
    { $addFields: { categoryRank: categoryRankExpression } },
    {
      $sort: {
        categoryRank: 1,
        displayOrder: 1,
        createdAt: 1,
        dishName: 1,
        _id: 1,
      },
    },
    { $project: { categoryRank: 0 } },
  ]);
  return items;
};

// ─── Get Single Menu Item ─────────────────────────────────────────────────────
export const getMenuItemById = async (id) => {
  const item = await MenuItem.findById(id);
  if (!item) throw new AppError('Menu item not found', 404);
  return item;
};

// ─── Update Menu Item ─────────────────────────────────────────────────────────
export const updateMenuItem = async (id, data, newImageUrl) => {
  const item = await MenuItem.findById(id);
  if (!item) throw new AppError('Menu item not found', 404);

  // If a new image was uploaded, delete the old one from Cloudinary
  if (newImageUrl) {
    await deleteCloudinaryImage(item.image);
    data.image = newImageUrl;
  }

  if (data.category && categoryKey(data.category) !== categoryKey(item.category) && !data.displayOrder) {
    data.displayOrder = await nextDisplayOrder(data.category, item._id);
  }

  Object.assign(item, data);
  await item.save();
  return item;
};

// ─── Delete Menu Item ─────────────────────────────────────────────────────────
export const deleteMenuItem = async (id) => {
  const item = await MenuItem.findById(id);
  if (!item) throw new AppError('Menu item not found', 404);

  await deleteCloudinaryImage(item.image);
  await item.deleteOne();
};

// ─── Toggle Availability ──────────────────────────────────────────────────────
export const toggleAvailability = async (id) => {
  const item = await MenuItem.findById(id);
  if (!item) throw new AppError('Menu item not found', 404);

  item.isAvailable = !item.isAvailable;
  await item.save();
  return item;
};

// ─── Toggle Featured ──────────────────────────────────────────────────────────
export const toggleFeatured = async (id) => {
  const item = await MenuItem.findById(id);
  if (!item) throw new AppError('Menu item not found', 404);

  item.isFeatured = !item.isFeatured;
  await item.save();
  return item;
};

// ─── Get All Unique Categories ────────────────────────────────────────────────
export const getCategories = async () => {
  const categories = await MenuItem.distinct('category');
  const categoryOrder = new Map(CATEGORY_ORDER.map((name, index) => [name, index]));
  return categories.sort((a, b) => {
    const rankDifference = (categoryOrder.get(categoryKey(a)) ?? 99) - (categoryOrder.get(categoryKey(b)) ?? 99);
    return rankDifference || a.localeCompare(b);
  });
};
