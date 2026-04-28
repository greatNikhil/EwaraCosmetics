import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem extends Document {
  userId: mongoose.Types.ObjectId;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  addedAt: Date;
}

const cartItemSchema = new Schema({
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
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
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
cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const CartItem =
  mongoose.models.CartItem ||
  mongoose.model<ICartItem>("CartItem", cartItemSchema);
