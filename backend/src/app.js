import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { corsOptions } from './config/corsConfig.js';
import { morganStream } from './config/loggerConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── HTTP Request Logger ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(morgan('combined', { stream: morganStream }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
import authRoutes      from './routes/auth.routes.js';
import menuRoutes      from './routes/menu.routes.js';
import orderRoutes     from './routes/order.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import profileRoutes   from './routes/profile.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import reviewRoutes    from './routes/review.routes.js';
import ttsRoutes       from './routes/tts.routes.js';

app.use('/api/v1/auth',      authRoutes);
app.use('/api/v1/menu',      menuRoutes);
app.use('/api/v1/orders',    orderRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/profile',   profileRoutes);
app.use('/api/v1/favorites', favoritesRoutes);
app.use('/api/v1/reviews',   reviewRoutes);
app.use('/api/v1/tts',       ttsRoutes);

// ─── Dev-only seed endpoint ───────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  const { default: MenuItem } = await import('./models/MenuItem.js');
  const PLACEHOLDER = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
  const SEED_ITEMS = [
    { dishName: 'Hot & Spicy Special Chicken Karahi', description: 'Tender chicken cooked in rich spicy tomato gravy with fresh herbs.',    category: 'BBQ',       price: 1850, isFeatured: true },
    { dishName: 'Lahori Chicken Karahi',              description: 'Traditional Lahori-style chicken karahi with authentic spices.',         category: 'BBQ',       price: 1750 },
    { dishName: 'Mutton Karahi',                      description: 'Slow-cooked mutton in aromatic desi masala.',                            category: 'BBQ',       price: 2850 },
    { dishName: 'Special Chicken Biryani',            description: 'Long-grain basmati rice with spicy chicken and aromatic herbs.',         category: 'Biryani',   price: 550,  isFeatured: true },
    { dishName: 'Mutton Biryani',                     description: 'Premium mutton biryani with saffron rice.',                              category: 'Biryani',   price: 750 },
    { dishName: 'Chicken Tikka (2 pcs)',              description: 'Charcoal grilled spicy chicken tikka.',                                  category: 'Grills',    price: 690 },
    { dishName: 'Seekh Kebab (4 pcs)',                description: 'Juicy beef seekh kebabs grilled over charcoal.',                        category: 'Grills',    price: 650 },
    { dishName: 'Chicken Malai Boti',                 description: 'Creamy grilled chicken cubes with mild spices.',                        category: 'Grills',    price: 790 },
    { dishName: 'Hot Zinger Burger',                  description: 'Crispy chicken fillet with spicy sauce and cheese.',                    category: 'Burgers',   price: 690 },
    { dishName: 'Double Beef Burger',                 description: 'Double beef patties with cheddar cheese and caramelized onions.',       category: 'Burgers',   price: 890 },
    { dishName: 'Chicken Fajita Pizza',               description: 'Thin crust pizza topped with fajita chicken and mozzarella.',           category: 'Pizza',     price: 1490 },
    { dishName: 'Hot & Spicy Special Pizza',          description: 'Signature spicy pizza with chicken, olives and jalapeños.',             category: 'Pizza',     price: 1690, isFeatured: true },
    { dishName: 'Chicken Fried Rice',                 description: 'Classic fried rice with vegetables and chicken.',                       category: 'Chinese',   price: 620 },
    { dishName: 'Chicken Chow Mein',                  description: 'Stir-fried noodles with vegetables and chicken.',                       category: 'Chinese',   price: 690 },
    { dishName: 'Loaded Fries',                       description: 'Crispy fries with cheese, chicken and sauces.',                         category: 'Fast Food', price: 550 },
    { dishName: 'Mint Margarita',                     description: 'Refreshing fresh mint drink.',                                          category: 'Drinks',    price: 280 },
    { dishName: 'Fresh Lime',                         description: 'Fresh lime juice with ice.',                                            category: 'Drinks',    price: 250 },
    { dishName: 'Chocolate Lava Cake',                description: 'Warm chocolate cake with molten center.',                               category: 'Dessert',   price: 550 },
    { dishName: 'Hot Brownie with Ice Cream',         description: 'Fresh brownie served with vanilla ice cream.',                          category: 'Dessert',   price: 650 },
    { dishName: 'Family Deal 1',                      description: '2 Karahi, 4 Naan, Salad & Drinks.',                                    category: 'Deals',     price: 3999, isFeatured: true },
  ].map((i) => ({ isAvailable: true, isFeatured: false, image: PLACEHOLDER, ...i }));

  app.post('/api/v1/dev/seed-menu', async (_req, res) => {
    await MenuItem.deleteMany({});
    const items = await MenuItem.insertMany(SEED_ITEMS);
    res.json({ success: true, message: `Seeded ${items.length} menu items`, count: items.length });
  });
}

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
