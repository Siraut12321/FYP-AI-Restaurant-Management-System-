import * as orderService from '../services/order.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// ─── Place Order (Customer) ───────────────────────────────────────────────────
export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user._id, req.body);
    sendSuccess(res, 201, 'Order placed successfully', order);
  } catch (err) {
    next(err);
  }
};

// ─── Place Voice Order (Machine-to-Machine) ──────────────────────────────────
export const createVoiceOrder = async (req, res, next) => {
  try {
    const order = await orderService.createVoiceOrder(req.body);
    sendSuccess(res, 201, 'Voice order placed successfully', order);
  } catch (err) {
    next(err);
  }
};

// ─── Get My Orders (Customer) ─────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user._id, req.user.phone);
    sendSuccess(res, 200, 'Your orders fetched successfully', orders);
  } catch (err) {
    next(err);
  }
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
export const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    sendSuccess(res, 200, 'All orders fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Order ─────────────────────────────────────────────────────────
export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    sendSuccess(res, 200, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};

// ─── Get Customer Order Tracking ─────────────────────────────────────────────
export const getOrderTracking = async (req, res, next) => {
  try {
    const tracking = await orderService.getOrderTracking(req.params.id, req.user);
    sendSuccess(res, 200, 'Order tracking fetched successfully', tracking);
  } catch (err) {
    next(err);
  }
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.orderStatus);
    sendSuccess(res, 200, `Order status updated to "${order.orderStatus}"`, order);
  } catch (err) {
    next(err);
  }
};

// ─── Delete Order (Admin) ─────────────────────────────────────────────────────
export const deleteOrder = async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id);
    sendSuccess(res, 200, 'Order deleted successfully', {});
  } catch (err) {
    next(err);
  }
};
