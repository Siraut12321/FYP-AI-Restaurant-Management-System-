import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    dishName: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      maxlength: [100, 'Dish name cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    displayOrder: {
      type: Number,
      min: [1, 'Display order must be a positive number'],
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than zero'],
    },

    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price cannot be negative'],
    },

    ingredients: {
      type: [String],
      default: [],
    },

    preparationTime: {
      type: Number, // in minutes
      default: null,
    },

    image: {
      type: String, // Cloudinary URL
      required: [true, 'Image is required'],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 5,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ category: 1, displayOrder: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
