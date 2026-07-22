/**
 * customerService.js
 * Frontend service for customer management.
 * TODO: Replace all localStorage logic with Axios API calls when backend is ready.
 * Example: import api from '../api/api';
 */

const KEY = 'admin_customers_v2';

const SEED = [
  { id: 'C001', name: 'Ali Khan',    phone: '+92-300-1234567', email: 'ali@example.com',    orders: 12, spending: 14376, status: 'active',   joined: '2024-08-10' },
  { id: 'C002', name: 'Sara Ahmad',  phone: '+92-321-9876543', email: 'sara@example.com',   orders: 7,  spending: 8260,  status: 'active',   joined: '2024-09-22' },
  { id: 'C003', name: 'Usman Raza',  phone: '+92-333-5556677', email: 'usman@example.com',  orders: 3,  spending: 3450,  status: 'inactive', joined: '2024-11-01' },
  { id: 'C004', name: 'Fatima Noor', phone: '+92-345-1122334', email: 'fatima@example.com', orders: 19, spending: 22100, status: 'active',   joined: '2024-07-05' },
  { id: 'C005', name: 'Hamza Malik', phone: '+92-311-8899001', email: 'hamza@example.com',  orders: 5,  spending: 5990,  status: 'active',   joined: '2024-12-15' },
];

function read() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function write(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}
function init() {
  if (!read()) write(SEED);
}
init();

export const customerService = {
  // TODO: GET /api/customers
  listCustomers() { return read() || []; },

  // TODO: GET /api/customers/:id
  getCustomer(id) { return (read() || []).find((c) => c.id === id) || null; },

  // TODO: POST /api/customers
  createCustomer(obj) {
    const arr = read() || [];
    const item = { ...obj, id: `C${Date.now()}` };
    write([...arr, item]);
    return item;
  },

  // TODO: PATCH /api/customers/:id
  updateCustomer(id, patch) {
    const next = (read() || []).map((c) => (c.id === id ? { ...c, ...patch } : c));
    write(next);
    return next;
  },

  // TODO: DELETE /api/customers/:id
  deleteCustomer(id) {
    const next = (read() || []).filter((c) => c.id !== id);
    write(next);
    return next;
  },
};

export default customerService;
