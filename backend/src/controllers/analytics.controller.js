import { getDashboardStats } from '../services/analytics.service.js';
import { sendSuccess }        from '../utils/apiResponse.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await getDashboardStats();
    sendSuccess(res, 200, 'Dashboard stats fetched', data);
  } catch (err) {
    next(err);
  }
};
