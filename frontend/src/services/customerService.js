import api from '../api/api.js';

const customerService = {
  // Get all customers with stats (admin only)
  async getCustomers() {
    try {
      const { data } = await api.get('/admin/customers');
      return data.data;
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      throw err;
    }
  },

  // Get customer by ID
  async getCustomer(id) {
    try {
      const { data } = await api.get(`/admin/customers/${id}`);
      return data.data;
    } catch (err) {
      console.error('Failed to fetch customer:', err);
      throw err;
    }
  },
};

export default customerService;
