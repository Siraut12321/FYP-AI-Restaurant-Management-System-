import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const debug = async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME || 'restaurant_ai' });

  const user = await User.findOne({ email: 'admin@restaurant.com' }).select('+password');
  if (!user) { console.log('No admin user found'); process.exit(1); }

  console.log('User found:', user.email, '| role:', user.role);
  console.log('Stored hash:', user.password);

  const match = await bcrypt.compare('Admin@1234', user.password);
  console.log('Password match:', match);

  process.exit(0);
};

debug().catch((err) => { console.error(err.message); process.exit(1); });
