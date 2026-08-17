import User from '../models/User.js';
import Order from '../models/Order.js';
import { normalizePhoneForLookup } from '../utils/phone.js';

/**
 * Get all customers with their order statistics
 * Used by Admin Customers dashboard
 */
export const getCustomersWithStats = async () => {
  // Get all customers (users with role: 'customer')
  const users = await User.find({ role: 'customer' }).select('_id name email phone address createdAt updatedAt');

  if (!users.length) {
    return [];
  }

  // Get order aggregation by customer
  const orderStats = await Order.aggregate([
    {
      $group: {
        _id: '$customer',
        orderCount: { $sum: 1 },
        totalSpending: { $sum: '$totalAmount' },
        lastOrderDate: { $max: '$createdAt' },
        deliveredCount: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, 1, 0] },
        },
      },
    },
  ]);

  // Create a map for quick lookup
  const statsMap = {};
  orderStats.forEach((stat) => {
    if (stat._id) {
      statsMap[stat._id.toString()] = {
        orders: stat.orderCount,
        spending: stat.totalSpending,
        lastOrderDate: stat.lastOrderDate,
        deliveredCount: stat.deliveredCount,
      };
    }
  });

  // Calculate "active" status: customer who ordered within last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Map users to customer objects with stats
  const customers = users.map((user) => {
    const userStats = statsMap[user._id.toString()] || {
      orders: 0,
      spending: 0,
      lastOrderDate: null,
      deliveredCount: 0,
    };

    const isActive = userStats.lastOrderDate && userStats.lastOrderDate > thirtyDaysAgo;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      orders: userStats.orders,
      spending: userStats.spending,
      lastOrderDate: userStats.lastOrderDate,
      deliveredCount: userStats.deliveredCount,
      status: isActive ? 'active' : 'inactive',
      joined: user.createdAt,
    };
  });

  return customers;
};

/**
 * Calculate summary statistics from all customers
 */
export const getCustomersSummary = async (customers) => {
  const total = customers.length;
  const active = customers.filter((c) => c.status === 'active').length;
  const inactive = total - active;
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
  const totalSpending = customers.reduce((sum, c) => sum + c.spending, 0);
  const avgSpending = total > 0 ? Math.round(totalSpending / total) : 0;
  const topSpender = customers.reduce((max, c) => (c.spending > max.spending ? c : max), customers[0] || {});

  return {
    total,
    active,
    inactive,
    totalOrders,
    totalSpending,
    avgSpending,
    topSpender: topSpender.spending > 0 ? topSpender : null,
  };
};
