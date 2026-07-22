import Review from '../models/Review.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import AppError from '../utils/AppError.js';

const reviewProjection = 'customer menuItem rating comment createdAt updatedAt';

const findReviewForCustomer = async (reviewId, customerId) => {
  const review = await Review.findOne({ _id: reviewId, customer: customerId });
  if (!review) throw new AppError('Review not found', 404);
  return review;
};

const getPagination = (query = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

export const createReview = async (customerId, data) => {
  const { menuItem, rating, comment } = data;

  const [item, purchased] = await Promise.all([
    MenuItem.exists({ _id: menuItem }),
    Order.exists({ customer: customerId, 'orderItems.menuItem': menuItem }),
  ]);

  if (!item) throw new AppError('Menu item not found', 404);
  if (!purchased) throw new AppError('You can only review dishes you have purchased', 403);

  try {
    return await Review.create({ customer: customerId, menuItem, rating, comment });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('You have already reviewed this dish', 409);
    }
    throw err;
  }
};

export const getReviewsByMenuItem = async (menuItemId, query = {}) => {
  const itemExists = await MenuItem.exists({ _id: menuItemId });
  if (!itemExists) throw new AppError('Menu item not found', 404);

  const { page, limit, skip } = getPagination(query);
  const filter = { menuItem: menuItemId };

  const [reviews, total, summary] = await Promise.all([
    Review.find(filter)
      .select(reviewProjection)
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: filter },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } },
    ]),
  ]);

  return {
    reviews,
    summary: {
      averageRating: summary[0]?.averageRating ?? 0,
      totalReviews: total,
    },
    pagination: { page, limit, pages: Math.ceil(total / limit), total },
  };
};

export const updateReview = async (reviewId, customerId, data) => {
  const review = await findReviewForCustomer(reviewId, customerId);
  const allowedFields = ['rating', 'comment'];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) review[field] = data[field];
  });

  await review.save();
  return review;
};

export const deleteReview = async (reviewId, customerId) => {
  const review = await findReviewForCustomer(reviewId, customerId);
  await review.deleteOne();
};
