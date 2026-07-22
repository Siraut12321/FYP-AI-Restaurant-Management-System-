import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import AppError from '../utils/AppError.js';

// ─── Place Order ──────────────────────────────────────────────────────────────
export const createOrder = async (customerId, body) => {
  const { orderItems, shippingAddress, paymentMethod } = body;

  // Resolve each item from DB and calculate subtotals
  const resolvedItems = await Promise.all(
    orderItems.map(async ({ menuItem, quantity }) => {
      const item = await MenuItem.findById(menuItem);
      if (!item) throw new AppError(`Menu item not found: ${menuItem}`, 404);
      if (!item.isAvailable) throw new AppError(`"${item.dishName}" is currently unavailable`, 400);

      const price    = item.discountPrice ?? item.price;
      const subtotal = price * quantity;

      return { menuItem: item._id, dishName: item.dishName, quantity, price, subtotal };
    })
  );

  const totalAmount = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);

  const order = await Order.create({
    customer: customerId,
    orderItems: resolvedItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
  });

  return order;
};

// ─── Get Customer's Own Orders ────────────────────────────────────────────────
export const getMyOrders = async (customerId) => {
  return Order.find({ customer: customerId })
    .populate('orderItems.menuItem', 'dishName image')
    .sort({ createdAt: -1 });
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
export const getAllOrders = async (query = {}) => {
  const filter = {};

  if (query.orderStatus) filter.orderStatus = query.orderStatus;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.search) {
    // search by customer name or shipping fullName via populate — use regex on stored field
    filter['shippingAddress.fullName'] = new RegExp(query.search, 'i');
  }

  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email')
      .populate('orderItems.menuItem', 'dishName image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, total, page, pages: Math.ceil(total / limit) };
};

// ─── Get Single Order ─────────────────────────────────────────────────────────
export const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId)
    .populate('customer', 'name email')
    .populate('orderItems.menuItem', 'dishName image');

  if (!order) throw new AppError('Order not found', 404);

  // Customers can only view their own orders
  if (user.role !== 'admin' && order.customer._id.toString() !== user._id.toString()) {
    throw new AppError('Not authorized to view this order', 403);
  }

  return order;
};

// ─── Get Customer Order Tracking ─────────────────────────────────────────────
export const getOrderTracking = async (orderId, user) => {
  const order = await Order.findById(orderId)
    .populate('customer', '_id')
    .populate('orderItems.menuItem', 'preparationTime');

  if (!order) throw new AppError('Order not found', 404);

  if (user.role !== 'admin' && order.customer._id.toString() !== user._id.toString()) {
    throw new AppError('Not authorized to view this order', 403);
  }

  const preparationTimes = order.orderItems
    .map(({ menuItem }) => menuItem?.preparationTime)
    .filter((time) => Number.isFinite(time) && time > 0);

  return {
    orderId: order._id,
    currentStatus: order.orderStatus,
    orderDate: order.createdAt,
    estimatedPreparationTime: preparationTimes.length ? Math.max(...preparationTimes) : null,
    timeline: ['Pending', 'Preparing', 'Ready', 'Delivered'],
    isCancelled: order.orderStatus === 'Cancelled',
  };
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
export const updateOrderStatus = async (orderId, orderStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  order.orderStatus = orderStatus;

  // Auto-mark payment as Paid when delivered
  if (orderStatus === 'Delivered') order.paymentStatus = 'Paid';

  await order.save();
  return order;
};

// ─── Delete Order (Admin) ─────────────────────────────────────────────────────
export const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  await order.deleteOne();
};
