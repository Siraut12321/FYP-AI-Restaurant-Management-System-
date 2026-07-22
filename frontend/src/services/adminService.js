// Simple mock admin service using localStorage for persistence
const STORAGE_KEYS = {
  ORDERS: 'admin_orders_v1',
  CUSTOMERS: 'admin_customers_v1',
  MENU: 'admin_menu_v1',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

// Seed data for first run
function seed() {
  if (!read(STORAGE_KEYS.MENU)) {
    write(STORAGE_KEYS.MENU, [
      { id: 'm1', name: 'Mutton Biryani', price: '₨899', category: 'Main' },
      { id: 'm2', name: 'Seekh Kebab', price: '₨299', category: 'Starter' },
    ]);
  }
  if (!read(STORAGE_KEYS.CUSTOMERS)) {
    write(STORAGE_KEYS.CUSTOMERS, [
      { id: 'c1', name: 'Ali Khan', email: 'ali@example.com', orders: 4 },
      { id: 'c2', name: 'Sara Ahmad', email: 'sara@example.com', orders: 2 },
    ]);
  }
  if (!read(STORAGE_KEYS.ORDERS)) {
    write(STORAGE_KEYS.ORDERS, [
      { id: 'o1', customer: 'Ali Khan', items: ['Mutton Biryani'], total: '₨899', status: 'pending' },
      { id: 'o2', customer: 'Sara Ahmad', items: ['Seekh Kebab'], total: '₨299', status: 'completed' },
    ]);
  }
}

seed();

export const adminService = {
  // Orders
  listOrders() { return read(STORAGE_KEYS.ORDERS) || []; },
  updateOrder(id, patch) {
    const arr = read(STORAGE_KEYS.ORDERS) || [];
    const next = arr.map((o) => (o.id === id ? { ...o, ...patch } : o));
    write(STORAGE_KEYS.ORDERS, next);
    return next;
  },
  deleteOrder(id) {
    const arr = read(STORAGE_KEYS.ORDERS) || [];
    const next = arr.filter((o) => o.id !== id);
    write(STORAGE_KEYS.ORDERS, next);
    return next;
  },

  // Customers
  listCustomers() { return read(STORAGE_KEYS.CUSTOMERS) || []; },
  createCustomer(obj) {
    const arr = read(STORAGE_KEYS.CUSTOMERS) || [];
    const next = [...arr, obj];
    write(STORAGE_KEYS.CUSTOMERS, next);
    return next;
  },
  updateCustomer(id, patch) {
    const arr = read(STORAGE_KEYS.CUSTOMERS) || [];
    const next = arr.map((c) => (c.id === id ? { ...c, ...patch } : c));
    write(STORAGE_KEYS.CUSTOMERS, next);
    return next;
  },
  deleteCustomer(id) {
    const arr = read(STORAGE_KEYS.CUSTOMERS) || [];
    const next = arr.filter((c) => c.id !== id);
    write(STORAGE_KEYS.CUSTOMERS, next);
    return next;
  },

  // Menu
  listMenu() { return read(STORAGE_KEYS.MENU) || []; },
  createMenuItem(item) {
    const arr = read(STORAGE_KEYS.MENU) || [];
    const next = [...arr, item];
    write(STORAGE_KEYS.MENU, next);
    return next;
  },
  updateMenuItem(id, patch) {
    const arr = read(STORAGE_KEYS.MENU) || [];
    const next = arr.map((m) => (m.id === id ? { ...m, ...patch } : m));
    write(STORAGE_KEYS.MENU, next);
    return next;
  },
  deleteMenuItem(id) {
    const arr = read(STORAGE_KEYS.MENU) || [];
    const next = arr.filter((m) => m.id !== id);
    write(STORAGE_KEYS.MENU, next);
    return next;
  },
};

export default adminService;
