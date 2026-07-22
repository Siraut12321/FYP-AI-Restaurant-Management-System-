import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
  },
  { timestamps: true }
);

// ─── One favorite per customer per menu item ──────────────────────────────────
favoriteSchema.index({ customer: 1, menuItem: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
