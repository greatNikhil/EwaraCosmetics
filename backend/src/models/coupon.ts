import mongoose, { Document, Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percent", "flat"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon =
  mongoose.models.Coupon ||
  mongoose.model<ICoupon>("Coupon", couponSchema);

export default Coupon;
