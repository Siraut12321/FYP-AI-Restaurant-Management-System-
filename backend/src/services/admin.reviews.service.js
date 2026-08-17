import Review from '../models/Review.js';

/**
 * Get all reviews for admin dashboard
 */
export const getAdminReviews = async () => {
  const reviews = await Review.find()
    .populate('customer', 'name email avatar')
    .populate('menuItem', 'dishName image category')
    .sort({ createdAt: -1 });

  // Transform reviews for admin display
  const transformedReviews = reviews.map((review) => ({
    id: review._id.toString(),
    customer: review.customer?.name || 'Unknown',
    email: review.customer?.email || 'N/A',
    avatar: review.customer?.avatar || null,
    rating: review.rating,
    comment: review.text || review.comment,
    dish: review.menuItem?.dishName || 'Unknown Dish',
    dishImage: review.menuItem?.image || null,
    date: review.createdAt,
    sentiment:
      review.rating >= 4
        ? 'positive'
        : review.rating === 3
          ? 'neutral'
          : 'negative',
  }));

  return transformedReviews;
};

/**
 * Calculate review summary statistics
 */
export const getReviewsSummary = async (reviews) => {
  if (!reviews.length) {
    return {
      totalReviews: 0,
      averageRating: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
    };
  }

  const totalReviews = reviews.length;
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);
  const positive = reviews.filter((r) => r.sentiment === 'positive').length;
  const negative = reviews.filter((r) => r.sentiment === 'negative').length;
  const neutral = reviews.filter((r) => r.sentiment === 'neutral').length;

  return {
    totalReviews,
    averageRating: parseFloat(avgRating),
    positive,
    negative,
    neutral,
  };
};
