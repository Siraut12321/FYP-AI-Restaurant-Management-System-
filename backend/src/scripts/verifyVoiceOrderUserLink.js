import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { createVoiceOrder } from '../services/order.service.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';

const userId = '6a4fb191eb0de80558d36b4d';
const menuItemId = '6a587b48dc2f3b326f85d637';

const originalUserFindById = User.findById;
const originalMenuFindById = MenuItem.findById;
const originalOrderCreate = Order.create;

try {
  User.findById = (targetId) => {
    assert.equal(String(targetId), userId);
    const user = {
      _id: new mongoose.Types.ObjectId(targetId),
      name: 'siraut',
      phone: '03420531897',
      select: function select() {
        return this;
      },
    };
    return user;
  };

  MenuItem.findById = async (targetId) => {
    assert.equal(String(targetId), menuItemId);
    return {
      _id: new mongoose.Types.ObjectId(targetId),
      dishName: 'Test Menu Item',
      isAvailable: true,
      price: 250,
      discountPrice: 250,
    };
  };

  Order.create = async (payload) => {
    assert.equal(String(payload.customer), userId, 'customer must equal userId for a valid authenticated voice order');
    assert.equal(payload.orderSource, 'Voice', 'orderSource must be Voice');
    assert.equal(payload.shippingAddress.phone, '03420531897');
    assert.equal(payload.orderItems[0].menuItem.toString(), menuItemId);
    return {
      ...payload,
      _id: new mongoose.Types.ObjectId('6a818296736871c9b4159091'),
    };
  };

  const generatedOrder = await createVoiceOrder({
    userId,
    shippingAddress: {
      fullName: 'siraut',
      phone: '03420531897',
      address: 'H 1080, St 95, Sector i-10/1 Islamabad',
      city: 'Islamabad',
    },
    orderItems: [{ menuItem: menuItemId, quantity: 1 }],
    paymentMethod: 'Cash on Delivery',
  });

  assert.equal(String(generatedOrder.customer), userId);
  assert.equal(generatedOrder.orderSource, 'Voice');

  console.log('VOICE ORDER USER LINK TEST: PASS');
  console.log(JSON.stringify({
    customer: String(generatedOrder.customer),
    orderSource: generatedOrder.orderSource,
    paymentMethod: generatedOrder.paymentMethod,
    userId,
  }, null, 2));
} finally {
  User.findById = originalUserFindById;
  MenuItem.findById = originalMenuFindById;
  Order.create = originalOrderCreate;
}
