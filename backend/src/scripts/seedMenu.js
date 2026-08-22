import 'dotenv/config';
import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';

const PLACEHOLDER = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

const menuItems = [
  // ── BBQ ──────────────────────────────────────────────────────────────────
  { dishName: 'Hot & Spicy Special Chicken Karahi', description: 'Tender chicken cooked in rich spicy tomato gravy with fresh herbs.', category: 'BBQ', price: 1850, isFeatured: true },
  { dishName: 'Lahori Chicken Karahi',              description: 'Traditional Lahori-style chicken karahi with authentic spices.',    category: 'BBQ', price: 1750 },
  { dishName: 'Mutton Karahi',                      description: 'Slow-cooked mutton in aromatic desi masala.',                       category: 'BBQ', price: 2850 },
  // ── Biryani ───────────────────────────────────────────────────────────────
  { dishName: 'Special Chicken Biryani', description: 'Long-grain basmati rice with spicy chicken and aromatic herbs.', category: 'Biryani', price: 550,  isFeatured: true },
  { dishName: 'Mutton Biryani',          description: 'Premium mutton biryani with saffron rice.',                      category: 'Biryani', price: 750 },
  // ── Grills ────────────────────────────────────────────────────────────────
  { dishName: 'Chicken Tikka (2 pcs)', description: 'Charcoal grilled spicy chicken tikka.',              category: 'Grills', price: 690 },
  { dishName: 'Seekh Kebab (4 pcs)',   description: 'Juicy beef seekh kebabs grilled over charcoal.',     category: 'Grills', price: 650 },
  { dishName: 'Chicken Malai Boti',    description: 'Creamy grilled chicken cubes with mild spices.',     category: 'Grills', price: 790 },
  // ── Burgers ───────────────────────────────────────────────────────────────
  { dishName: 'Hot Zinger Burger',  description: 'Crispy chicken fillet with spicy sauce and cheese.',              category: 'Burgers', price: 690 },
  { dishName: 'Double Beef Burger', description: 'Double beef patties with cheddar cheese and caramelized onions.', category: 'Burgers', price: 890 },
  // ── Pizza ─────────────────────────────────────────────────────────────────
  { dishName: 'Chicken Fajita Pizza',       description: 'Thin crust pizza topped with fajita chicken and mozzarella.',    category: 'Pizza', price: 1490 },
  { dishName: 'Hot & Spicy Special Pizza',  description: 'Signature spicy pizza with chicken, olives and jalapeños.',      category: 'Pizza', price: 1690, isFeatured: true },
  // ── Chinese ───────────────────────────────────────────────────────────────
  { dishName: 'Chicken Fried Rice', description: 'Classic fried rice with vegetables and chicken.',    category: 'Chinese', price: 620 },
  { dishName: 'Chicken Chow Mein',  description: 'Stir-fried noodles with vegetables and chicken.',    category: 'Chinese', price: 690 },
  // ── Fast Food ─────────────────────────────────────────────────────────────
  { dishName: 'Loaded Fries', description: 'Crispy fries with cheese, chicken and sauces.', category: 'Fast Food', price: 550 },
  // ── Drinks ────────────────────────────────────────────────────────────────
  { dishName: 'Mint Margarita', description: 'Refreshing fresh mint drink.', category: 'Drinks', price: 280 },
  { dishName: 'Fresh Lime',     description: 'Fresh lime juice with ice.',   category: 'Drinks', price: 250 },
  // ── Dessert ───────────────────────────────────────────────────────────────
  { dishName: 'Chocolate Lava Cake',       description: 'Warm chocolate cake with molten center.',          category: 'Dessert', price: 550 },
  { dishName: 'Hot Brownie with Ice Cream',description: 'Fresh brownie served with vanilla ice cream.',     category: 'Dessert', price: 650 },
  // ── Deals ─────────────────────────────────────────────────────────────────
  { dishName: 'Family Deal 1', description: '2 Karahi, 4 Naan, Salad & Drinks.', category: 'Deals', price: 3999, isFeatured: true },
].map((item, index, items) => ({
  isAvailable: true,
  isFeatured: false,
  image: PLACEHOLDER,
  ...item,
  displayOrder: items.slice(0, index + 1).filter((candidate) => candidate.category === item.category).length,
}));

const seedMenu = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });
    await MenuItem.deleteMany({});
    const inserted = await MenuItem.insertMany(menuItems);
    console.log(`✅ Seeded ${inserted.length} menu items`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedMenu();
