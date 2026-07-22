import api from '../api/api';

const reviewService = {
  async getReviews(menuItemId, params = {}) {
    const { data } = await api.get(`/reviews/${menuItemId}`, { params });
    return data.data;
  },

  async addReview({ menuItem, rating, comment }) {
    const { data } = await api.post('/reviews', { menuItem, rating, comment });
    return data.data;
  },

  async updateReview(id, { rating, comment }) {
    const { data } = await api.patch(`/reviews/${id}`, { rating, comment });
    return data.data;
  },

  async deleteReview(id) {
    const { data } = await api.delete(`/reviews/${id}`);
    return data.data;
  },
};

export default reviewService;
