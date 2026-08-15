import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import AppError from '../utils/AppError.js';

const resolveOrderItems = async (orderItems) => {
  const resolvedItems = await Promise.all(
    orderItems.map(async ({ menuItem, quantity }) => {
      const item = await MenuItem.findById(menuItem);
      if (!item) throw new AppError(`Menu item not found: ${menuItem}`, 404);
      if (!item.isAvailable) throw new AppError(`"${item.dishName}" is currently unavailable`, 400);

      const price = item.discountPrice ?? item.price;
      const subtotal = price * quantity;

      return {
        menuItem: item._id,
        dishName: item.dishName,
        quantity,
        price,
        subtotal,
      };
    })
  );

  return {
    resolvedItems,
    totalAmount: resolvedItems.reduce((sum, item) => sum + item.subtotal, 0),
  };
};

// ─── Place Order ──────────────────────────────────────────────────────────────
export const createOrder = async (customerId, body) => {
  const { orderItems, shippingAddress, paymentMethod } = body;

  const { resolvedItems, totalAmount } = await resolveOrderItems(orderItems);

  const order = await Order.create({
    customer: customerId,
    orderItems: resolvedItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
    orderSource: 'Website',
  });

  return order;
};

export const createVoiceOrder = async (body) => {
  const { customer, shippingAddress, orderItems, paymentMethod } = body;

  const { resolvedItems, totalAmount } = await resolveOrderItems(orderItems);

  const order = await Order.create({
    customer: customer ?? null,
    customerDetails: customer
      ? {
          name: customer.name,
          phone: customer.phone,
        }
      : {
          name: shippingAddress?.fullName || null,
          phone: shippingAddress?.phone || null,
        },
    orderItems: resolvedItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    orderSource: 'Voice',
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

  const customerId = order.customer?._id?.toString();

  // Customers can only view their own orders
  if (user.role !== 'admin' && (!customerId || customerId !== user._id.toString())) {
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

  const customerId = order.customer?._id?.toString();

  if (user.role !== 'admin' && (!customerId || customerId !== user._id.toString())) {
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

  // Notify n8n webhook about status change. Failures here must not block the main flow.
  try {
    const webhookUrl = process.env.N8N_STATUS_WEBHOOK;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id.toString(),
          status: order.orderStatus,
          customerName: order.shippingAddress?.fullName || '',
          phone: order.shippingAddress?.phone || '',
          email: order.customerDetails?.email || '',
        }),
      });
    }
  } catch (err) {
    console.error('n8n status webhook failed:', err);
  }

  return order;
};

// ─── Delete Order (Admin) ─────────────────────────────────────────────────────
export const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  await order.deleteOne();
};
