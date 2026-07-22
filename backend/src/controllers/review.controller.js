import * as reviewService from '../services/review.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user._id, req.body);
    sendSuccess(res, 201, 'Review added successfully', review);
  } catch (err) {
    next(err);
  }
};

export const getReviewsByMenuItem = async (req, res, next) => {
  try {
    const result = await reviewService.getReviewsByMenuItem(req.params.menuItemId, req.query);
    sendSuccess(res, 200, 'Reviews fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.params.id,
      req.user._id,
      req.body
    );
    sendSuccess(res, 200, 'Review updated successfully', review);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Review deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
