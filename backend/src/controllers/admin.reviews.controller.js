import { getAdminReviews as fetchAdminReviews, getReviewsSummary } from '../services/admin.reviews.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await fetchAdminReviews();
    const summary = await getReviewsSummary(reviews);

    sendSuccess(res, 200, 'Reviews fetched successfully', {
      reviews,
      summary,
    });
  } catch (err) {
    next(err);
  }
};
