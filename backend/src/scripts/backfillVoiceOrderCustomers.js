import 'dotenv/config';
import mongoose from 'mongoose';
import { normalizePhoneForLookup } from '../utils/phone.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

const run = async () => {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'restaurant_ai';

  if (!mongoUri) {
    console.error('MONGO_URI is not configured.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { dbName });

  const orphanOrders = await Order.find({ orderSource: 'Voice', customer: null }).lean();
  let updated = 0;
  let unresolved = 0;

  for (const order of orphanOrders) {
    const phone = order.shippingAddress?.phone;
    const candidates = normalizePhoneForLookup(phone);
    if (!candidates.length) {
      unresolved += 1;
      continue;
    }

    const matchedUsers = await User.find({ phone: { $in: candidates } }).select('_id name phone').lean();
    if (matchedUsers.length !== 1) {
      unresolved += 1;
      continue;
    }

    const matchedUser = matchedUsers[0];
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

  console.log(JSON.stringify({ totalOrphans: orphanOrders.length, updated, unresolved }, null, 2));
  process.exit(0);
};

run().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
