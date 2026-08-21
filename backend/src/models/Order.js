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
    email:    { type: String, required: function requiredForWebsiteOrder() { return this.ownerDocument().orderSource === 'Website'; }, trim: true, lowercase: true, match: [/^(?:[a-zA-Z0-9._%+-]+@gmail\.com|admin@restaurant\.com)$/, 'Please enter a valid Gmail address or the admin email.'] },
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
      enum: ['Cash on Delivery'],
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
