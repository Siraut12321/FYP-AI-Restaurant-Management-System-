import api from '../api/api.js';

const orderService = {
  // ─── Customer: Place Order ─────────────────────────────────────────────────
  // body: { orderItems, shippingAddress, paymentMethod }
  async placeOrder(body) {
    const { data } = await api.post('/orders', body);
    return data;
  },

  // ─── Customer: Get My Orders ───────────────────────────────────────────────
  async getMyOrders() {
    const { data } = await api.get('/orders/my-orders');
    return data;
  },

  // ─── Admin: Get All Orders ─────────────────────────────────────────────────
  // params: { orderStatus, paymentMethod, search, page, limit }
  async getAllOrders(params = {}) {
    const { data } = await api.get('/orders', { params });
    return data;
  },

  // ─── Shared: Get Single Order ──────────────────────────────────────────────
  async getOrderById(id) {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  // ─── Customer: Get Live Order Tracking ────────────────────────────────────
  async getOrderTracking(id) {
    const { data } = await api.get(`/orders/${id}/tracking`);
    return data;
  },

  // ─── Admin: Update Order Status ────────────────────────────────────────────
  // orderStatus: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled'
  async updateOrderStatus(id, orderStatus) {
    const { data } = await api.patch(`/orders/${id}/status`, { orderStatus });
    return data;
  },

  // ─── Admin: Delete Order ───────────────────────────────────────────────────
  async deleteOrder(id) {
    const { data } = await api.delete(`/orders/${id}`);
    return data;
  },
};

export default orderService;
