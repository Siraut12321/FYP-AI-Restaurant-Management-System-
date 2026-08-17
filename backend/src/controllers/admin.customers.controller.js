import { getCustomersWithStats, getCustomersSummary } from '../services/admin.customers.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAdminCustomers = async (req, res, next) => {
  try {
    const customers = await getCustomersWithStats();
    const summary = await getCustomersSummary(customers);

    sendSuccess(res, 200, 'Customers fetched successfully', {
      customers,
      summary,
    });
  } catch (err) {
    next(err);
  }
};
