import * as favoritesService from '../services/favorites.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ─── POST /api/v1/favorites/:menuId ──────────────────────────────────────────
export const addFavorite = async (req, res, next) => {
  try {
    const favorite = await favoritesService.addFavorite(req.user._id, req.params.menuId);
    sendSuccess(res, 201, 'Added to favorites', favorite);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/favorites ────────────────────────────────────────────────────
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await favoritesService.getFavorites(req.user._id);
    sendSuccess(res, 200, 'Favorites fetched successfully', favorites);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/favorites/:menuId ────────────────────────────────────────
export const removeFavorite = async (req, res, next) => {
  try {
    await favoritesService.removeFavorite(req.user._id, req.params.menuId);
    sendSuccess(res, 200, 'Removed from favorites', {});
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/favorites/:menuId/check ─────────────────────────────────────
export const checkFavorite = async (req, res, next) => {
  try {
    const isFavorited = await favoritesService.isFavorited(req.user._id, req.params.menuId);
    sendSuccess(res, 200, 'Favorite status fetched', { isFavorited });
  } catch (err) {
    next(err);
  }
};
