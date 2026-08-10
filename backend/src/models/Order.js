import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    dishName:  { type: String, required: true },
    quantity:  { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
    price:     { type: Number, required: true },
    subtotal:  { type: Number, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    address:  { type: String, required: true, trim: true },
    city:     { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    customerDetails: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },

    orderSource: {
      type: String,
      enum: ['Website', 'Voice'],
      default: 'Website',
    },

    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Card', 'Online'],
      required: true,
    },

    orderStatus: {
      type: String,
      enum: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },

    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
