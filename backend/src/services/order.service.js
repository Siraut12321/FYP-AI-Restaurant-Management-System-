import mongoose from 'mongoose';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import { normalizePhoneForLookup } from '../utils/phone.js';

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

  // Trigger notifications asynchronously (non-blocking)
  try {
    (async () => { await sendOrderNotifications(order._id.toString()); })();
  } catch (err) {
    // swallow errors — notifications must not break order creation
    console.error('Order notification trigger failed:', err);
  }

  return order;
};

export const createVoiceOrder = async (body) => {
  const { customer, userId, shippingAddress, orderItems, paymentMethod } = body;

  const { resolvedItems, totalAmount } = await resolveOrderItems(orderItems);

  console.info('[VOICE ORDER DEBUG]', {
    userId: userId || null,
    hasCustomer: Boolean(customer),
    customerId: customer?._id || customer?.id || null,
    shippingPhone: shippingAddress?.phone || null,
  });

  // Resolve customer identity in priority order:
  // 1) trusted userId (must be authoritative when supplied)
  // 2) customer._id / customer.id (legacy fallback only when no userId provided)
  // 3) phone match on User (legacy fallback only when no userId provided)
  // 4) customer object details
  // 5) shippingAddress fallback
  let resolvedCustomer = null;
  let customerDetails = null;

  const resolveUserById = async (targetId) => {
    if (!targetId) return null;
    if (!mongoose.Types.ObjectId.isValid(String(targetId))) {
      throw new AppError('Voice order rejected: supplied userId is not a valid MongoDB ObjectId.', 400);
    }

    const user = await User.findById(targetId).select('_id name phone');
    return user;
  };

  const resolveUserByPhone = async (phoneValue) => {
    const lookupValues = normalizePhoneForLookup(phoneValue);
    if (!lookupValues.length) return null;

    const user = await User.findOne({
      phone: { $in: lookupValues },
    }).select('name phone');

    return user;
  };

  if (userId) {
    const userFromId = await resolveUserById(userId);
    if (!userFromId) {
      throw new AppError('Voice order rejected: supplied userId does not match any user account.', 400);
    }

    resolvedCustomer = userFromId._id;
    customerDetails = { name: userFromId.name, phone: userFromId.phone };
  } else if (customer) {
    const customerId = customer._id || customer.id || null;
    const userFromCustomerId = customerId ? await resolveUserById(customerId) : null;
    if (userFromCustomerId) {
      resolvedCustomer = userFromCustomerId._id;
      customerDetails = { name: userFromCustomerId.name, phone: userFromCustomerId.phone };
    }

    if (!resolvedCustomer) {
      const customerPhone = customer.phone || shippingAddress?.phone || null;
      const userFromCustomerPhone = customerPhone ? await resolveUserByPhone(customerPhone) : null;
      if (userFromCustomerPhone) {
        resolvedCustomer = userFromCustomerPhone._id;
        customerDetails = { name: userFromCustomerPhone.name, phone: userFromCustomerPhone.phone };
      }
    }
  }

  if (!resolvedCustomer && !userId) {
    const phoneMatchUser = shippingAddress?.phone ? await resolveUserByPhone(shippingAddress.phone) : null;
    if (phoneMatchUser) {
      resolvedCustomer = phoneMatchUser._id;
      customerDetails = { name: phoneMatchUser.name, phone: phoneMatchUser.phone };
    }
  }

  console.info('[VOICE ORDER DEBUG]', {
    userId: userId || null,
    resolvedCustomer: resolvedCustomer ? resolvedCustomer.toString() : null,
    customerDetails: customerDetails ? { name: customerDetails.name, phone: customerDetails.phone } : null,
  });

  if (!customerDetails) {
    customerDetails = {
      name: customer?.name || shippingAddress?.fullName || null,
      phone: customer?.phone || shippingAddress?.phone || null,
    };
  }

  const order = await Order.create({
    customer: resolvedCustomer,
    customerDetails,
    orderItems: resolvedItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    orderSource: 'Voice',
  });
  // Trigger notifications asynchronously (non-blocking)
  try {
    (async () => { await sendOrderNotifications(order._id.toString()); })();
  } catch (err) {
    console.error('Voice order notification trigger failed:', err);
  }

  return order;
};

export const backfillVoiceOrderCustomers = async () => {
  const orphanOrders = await Order.find({ orderSource: 'Voice', customer: null }).lean();
  let updated = 0;
  let unresolved = 0;

  for (const order of orphanOrders) {
    const phone = order.shippingAddress?.phone;
    const phoneCandidates = normalizePhoneForLookup(phone);

    if (!phoneCandidates.length) {
      unresolved += 1;
      continue;
    }

    const users = await User.find({ phone: { $in: phoneCandidates } }).select('_id name phone').lean();
    const uniqueMatches = [...new Map(users.map((user) => [user._id.toString(), user])).values()];

    if (uniqueMatches.length !== 1) {
      unresolved += 1;
      continue;
    }

    const matchedUser = uniqueMatches[0];
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          customer: matchedUser._id,
          customerDetails: {
            name: matchedUser.name || order.customerDetails?.name || order.shippingAddress?.fullName || null,
            phone: matchedUser.phone || order.customerDetails?.phone || order.shippingAddress?.phone || null,
          },
        },
      }
    );

    updated += 1;
  }

  return { updated, unresolved, totalOrphans: orphanOrders.length };
};

// ─── Send Notifications (WhatsApp via Zapier/n8n + optional email) ─────────
const sendOrderNotifications = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('orderItems.menuItem', 'dishName image')
      .populate('customer', 'name email');

    if (!order) return;

    const webhookUrl = process.env.N8N_ORDER_WEBHOOK;

    const items = order.orderItems.map((it) => ({
      dishName: it.dishName,
      quantity: it.quantity,
      price: it.price,
      subtotal: it.subtotal,
      image: it.menuItem?.image || null,
    }));

    const payload = {
      orderId: order._id.toString(),
      orderSource: order.orderSource,
      paymentMethod: order.paymentMethod,
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      customerName: order.customer?.name || order.customerDetails?.name || order.shippingAddress?.fullName || '',
      phone: order.customerDetails?.phone || order.shippingAddress?.phone || '',
      items,
    };

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('n8n order webhook failed:', err);
      }
    }

    // Optional email: only if SMTP env vars are configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM) {
      try {
        // dynamic require so nodemailer is optional
        // eslint-disable-next-line global-require, import/no-extraneous-dependencies
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: (process.env.SMTP_SECURE === 'true') || false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const toEmail = order.customer?.email || process.env.EMAIL_FALLBACK_TO || null;
        if (!toEmail) return;

        const itemsHtml = items.map((it) => `
          <tr>
            <td style="padding:8px;border-radius:6px;vertical-align:top"><img src="${it.image || ''}" alt="${it.dishName}" width="96" style="border-radius:8px;object-fit:cover"/></td>
            <td style="padding:8px;vertical-align:top"><strong>${it.dishName}</strong><br/>Qty: ${it.quantity}<br/>Price: PKR ${it.price}</td>
          </tr>
        `).join('');

        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif;color:#111;background:#0b0b0b;padding:20px;border-radius:10px">
            <h2 style="color:#ffd166">🌶️ Hot & Spicy — Order Confirmed</h2>
            <p>Assalamu Alaikum ${order.customer?.name || ''},</p>
            <p>Thank you for your order! Here is your order summary:</p>
            <table style="width:100%;border-collapse:collapse;color:#eee">${itemsHtml}</table>
            <p><strong>Total: PKR ${order.totalAmount}</strong></p>
            <p>Payment: ${order.paymentMethod}<br/>Status: ${order.orderStatus}</p>
            <p>Thank you for ordering from Hot & Spicy ❤️</p>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: toEmail,
          subject: `🌶️ Hot & Spicy — Order Confirmed #${order._id.toString()}`,
          html,
        });
      } catch (err) {
        console.error('Order confirmation email failed:', err);
      }
    }
  } catch (err) {
    console.error('sendOrderNotifications error:', err);
  }
};

// ─── Get Customer's Own Orders ────────────────────────────────────────────────
export const getMyOrders = async (customerId, phone = null) => {
  const filters = [];
  if (customerId) filters.push({ customer: customerId });

  const phoneCandidates = normalizePhoneForLookup(phone);
  if (phoneCandidates.length) {
    filters.push({ 'customerDetails.phone': { $in: phoneCandidates } });
    filters.push({ 'shippingAddress.phone': { $in: phoneCandidates } });
  }

  const query = filters.length ? { $or: filters } : { customer: customerId };

  return Order.find(query)
    .populate('orderItems.menuItem', 'dishName image')
    .sort({ createdAt: -1 });
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
export const getAllOrders = async (query = {}) => {
  const filter = {};

  if (query.orderStatus) filter.orderStatus = query.orderStatus;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.orderSource) filter.orderSource = query.orderSource;
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
  const userPhone = user?.phone || null;

  const isOwnerById = customerId && customerId === user._id.toString();
  const isOwnerByPhone = userPhone && (
    order.customerDetails?.phone === userPhone || order.shippingAddress?.phone === userPhone
  );

  if (user.role !== 'admin' && !isOwnerById && !isOwnerByPhone) {
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
  const userPhone = user?.phone || null;

  const isOwnerById = customerId && customerId === user._id.toString();
  const isOwnerByPhone = userPhone && (
    order.customerDetails?.phone === userPhone || order.shippingAddress?.phone === userPhone
  );

  if (user.role !== 'admin' && !isOwnerById && !isOwnerByPhone) {
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
