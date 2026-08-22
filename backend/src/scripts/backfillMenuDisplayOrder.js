import 'dotenv/config';
import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';

const backfillMenuDisplayOrder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });
    const items = await MenuItem.find({}).sort({ category: 1, createdAt: 1, _id: 1 }).select('_id category').lean();
    const positions = new Map();

    for (const item of items) {
      const key = item.category.trim().toLowerCase();
      const position = (positions.get(key) || 0) + 1;
      positions.set(key, position);
      await MenuItem.updateOne({ _id: item._id }, { $set: { displayOrder: position } });
    }

    console.log(`Backfilled displayOrder for ${items.length} menu items.`);
  } catch (err) {
    console.error('Menu displayOrder backfill failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

backfillMenuDisplayOrder();