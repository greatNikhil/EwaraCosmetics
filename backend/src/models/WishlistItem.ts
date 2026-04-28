import mongoose, { Document, Schema } from "mongoose";

export interface IWishlistItem extends Document {
  userId: mongoose.Types.ObjectId;
  productId: string;
  productName: string;
  price: number;
  image: string;
  category: string;
  addedAt: Date;
}

const wishlistItemSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for userId + productId to prevent duplicates
wishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const WishlistItem =
  mongoose.models.WishlistItem ||
  mongoose.model<IWishlistItem>("WishlistItem", wishlistItemSchema);
