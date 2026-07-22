import Favorite from '../models/Favorite.js';
import MenuItem from '../models/MenuItem.js';
import AppError from '../utils/AppError.js';

// ─── Add Favorite ─────────────────────────────────────────────────────────────
export const addFavorite = async (userId, menuId) => {
  // Ensure menu item exists
  const item = await MenuItem.findById(menuId);
  if (!item) throw new AppError('Menu item not found', 404);

  // findOneAndUpdate with upsert avoids duplicate key race conditions
  const favorite = await Favorite.findOneAndUpdate(
    { customer: userId, menuItem: menuId },
    { customer: userId, menuItem: menuId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('menuItem', 'dishName image price category isAvailable');

  return favorite;
};

// ─── Get All Favorites for a Customer ────────────────────────────────────────
export const getFavorites = async (userId) => {
  const favorites = await Favorite.find({ customer: userId })
    .populate('menuItem', 'dishName image price category isAvailable discountPrice rating')
    .sort({ createdAt: -1 });

  return favorites;
};

// ─── Remove Favorite ──────────────────────────────────────────────────────────
export const removeFavorite = async (userId, menuId) => {
  const favorite = await Favorite.findOneAndDelete({ customer: userId, menuItem: menuId });
  if (!favorite) throw new AppError('Favorite not found', 404);
};

// ─── Check if a menu item is favorited by the user ───────────────────────────
export const isFavorited = async (userId, menuId) => {
  const exists = await Favorite.exists({ customer: userId, menuItem: menuId });
  return !!exists;
};
