import Order    from '../models/Order.js';
import User     from '../models/User.js';
import MenuItem from '../models/MenuItem.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ─── Main dashboard aggregation ───────────────────────────────────────────────
export const getDashboardStats = async () => {
  const { start, end } = todayRange();

  const [
    orderStats,
    todayRevenue,
    totalCustomers,
    menuStats,
    popularDishes,
    recentOrders,
    salesLast7Days,
  ] = await Promise.all([

    // ── Order status counts + total revenue (delivered only) ──────────────────
    Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count:   { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, '$totalAmount', 0] } },
        },
      },
    ]),

    // ── Today's revenue (delivered orders only) ───────────────────────────────
    Order.aggregate([
      {
        $match: {
          orderStatus: 'Delivered',
          createdAt:   { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),

    // ── Total customers ───────────────────────────────────────────────────────
    User.countDocuments({ role: 'customer' }),

    // ── Menu item counts ──────────────────────────────────────────────────────
    MenuItem.aggregate([
      {
        $group: {
          _id:      null,
          total:    { $sum: 1 },
          featured: { $sum: { $cond: ['$isFeatured', 1, 0] } },
        },
      },
    ]),

    // ── Top 5 popular dishes ──────────────────────────────────────────────────
    Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id:      '$orderItems.menuItem',
          dishName: { $first: '$orderItems.dishName' },
          orders:   { $sum: '$orderItems.quantity' },
          revenue:  { $sum: '$orderItems.subtotal' },
        },
      },
      { $sort: { orders: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id:      0,
          dishName: 1,
          orders:   1,
          revenue:  1,
        },
      },
    ]),

    // ── Recent 10 orders ──────────────────────────────────────────────────────
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name')
      .select('customer totalAmount orderStatus createdAt'),

    // ── Sales last 7 days ─────────────────────────────────────────────────────
    Order.aggregate([
      {
        $match: {
          orderStatus: 'Delivered',
          createdAt:   { $gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id:     { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
    ]),
  ]);

  // ── Flatten order status counts ───────────────────────────────────────────
  const statusMap = {};
  let totalRevenue = 0;
  let totalOrders  = 0;

  for (const s of orderStats) {
    statusMap[s._id] = s.count;
    totalRevenue    += s.revenue;
    totalOrders     += s.count;
  }

  return {
    totalRevenue,
    todayRevenue:     todayRevenue[0]?.total    ?? 0,
    totalOrders,
    pendingOrders:    statusMap['Pending']   ?? 0,
    preparingOrders:  statusMap['Preparing'] ?? 0,
    readyOrders:      statusMap['Ready']     ?? 0,
    completedOrders:  statusMap['Delivered'] ?? 0,
    cancelledOrders:  statusMap['Cancelled'] ?? 0,
    totalCustomers,
    totalMenuItems:   menuStats[0]?.total    ?? 0,
    featuredItems:    menuStats[0]?.featured ?? 0,
    popularDishes,
    recentOrders: recentOrders.map((o) => ({
      id:          o._id,
      customerName: o.customer?.name ?? 'Guest',
      total:        o.totalAmount,
      status:       o.orderStatus,
      createdAt:    o.createdAt,
    })),
    salesLast7Days,
  };
};
