import api from '../api/api';

const favoritesService = {
  async getFavorites() {
    const { data } = await api.get('/favorites');
    return data.data;
  },

  async addFavorite(menuId) {
    const { data } = await api.post(`/favorites/${menuId}`);
    return data.data;
  },

  async removeFavorite(menuId) {
    const { data } = await api.delete(`/favorites/${menuId}`);
    return data.data;
  },

  async checkFavorite(menuId) {
    const { data } = await api.get(`/favorites/${menuId}/check`);
    return data.data;
  },
};

export default favoritesService;
