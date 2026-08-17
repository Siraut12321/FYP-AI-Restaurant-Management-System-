import * as menuService from '../services/menu.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// ─── Create Menu Item ─────────────────────────────────────────────────────────
export const createMenuItem = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'Image is required', []);

    // FormData sends booleans as strings and ingredients as 'ingredients[]'
    const body = { ...req.body };
    if (body['ingredients[]']) {
      body.ingredients = Array.isArray(body['ingredients[]'])
        ? body['ingredients[]']
        : [body['ingredients[]']];
      delete body['ingredients[]'];
    }
    if (body.isAvailable !== undefined) body.isAvailable = body.isAvailable === 'true';
    if (body.isFeatured  !== undefined) body.isFeatured  = body.isFeatured  === 'true';

    const item = await menuService.createMenuItem({ ...body, image: req.file.path });
    sendSuccess(res, 201, 'Menu item created successfully', item);
  } catch (err) {
    next(err);
  }
};

// ─── Get All Menu Items ───────────────────────────────────────────────────────
export const getAllMenuItems = async (req, res, next) => {
  try {
    const items = await menuService.getAllMenuItems(req.query);
    sendSuccess(res, 200, 'Menu items fetched successfully', items);
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Menu Item ─────────────────────────────────────────────────────
export const getMenuItemById = async (req, res, next) => {
  try {
    const item = await menuService.getMenuItemById(req.params.id);
    sendSuccess(res, 200, 'Menu item fetched successfully', item);
  } catch (err) {
    next(err);
  }
};

// ─── Update Menu Item ─────────────────────────────────────────────────────────
export const updateMenuItem = async (req, res, next) => {
  try {
    const newImageUrl = req.file ? req.file.path : null;
    const body = { ...req.body };
    if (body['ingredients[]']) {
      body.ingredients = Array.isArray(body['ingredients[]'])
        ? body['ingredients[]']
        : [body['ingredients[]']];
      delete body['ingredients[]'];
    }
    if (body.isAvailable !== undefined) body.isAvailable = body.isAvailable === 'true';
    if (body.isFeatured  !== undefined) body.isFeatured  = body.isFeatured  === 'true';

    const item = await menuService.updateMenuItem(req.params.id, body, newImageUrl);
    sendSuccess(res, 200, 'Menu item updated successfully', item);
  } catch (err) {
    next(err);
  }
};

// ─── Delete Menu Item ─────────────────────────────────────────────────────────
export const deleteMenuItem = async (req, res, next) => {
  try {
    await menuService.deleteMenuItem(req.params.id);
    sendSuccess(res, 200, 'Menu item deleted successfully', {});
  } catch (err) {
    next(err);
  }
};

// ─── Toggle Availability ──────────────────────────────────────────────────────
export const toggleAvailability = async (req, res, next) => {
  try {
    const item = await menuService.toggleAvailability(req.params.id);
    sendSuccess(res, 200, `Menu item is now ${item.isAvailable ? 'available' : 'unavailable'}`, item);
  } catch (err) {
    next(err);
  }
};

// ─── Toggle Featured ──────────────────────────────────────────────────────────
export const toggleFeatured = async (req, res, next) => {
  try {
    const item = await menuService.toggleFeatured(req.params.id);
    sendSuccess(res, 200, `Menu item is now ${item.isFeatured ? 'featured' : 'unfeatured'}`, item);
  } catch (err) {
    next(err);
  }
};

// ─── Get All Unique Categories ────────────────────────────────────────────────
export const getCategories = async (req, res, next) => {
  try {
    const categories = await menuService.getCategories();
    sendSuccess(res, 200, 'Categories fetched successfully', categories);
  } catch (err) {
    next(err);
  }
};
