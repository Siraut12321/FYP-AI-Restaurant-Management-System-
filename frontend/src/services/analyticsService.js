import api from '../api/api.js';

const getDashboardStats = async () => {
  const { data } = await api.get('/analytics/dashboard');
  return data.data;
};

const analyticsService = { getDashboardStats };

export default analyticsService;
