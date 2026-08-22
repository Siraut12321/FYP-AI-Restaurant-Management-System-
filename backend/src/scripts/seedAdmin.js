import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME || 'restaurant_ai' });

  await User.deleteOne({ email: 'admin@restaurant.com' });

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@restaurant.com',
    password: 'Admin@1234',
    role: 'admin',
  });

  console.log('Admin created successfully:');
  console.log('  Email   :', admin.email);
  console.log('  Password: Admin@1234');
  console.log('  Role    :', admin.role);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
