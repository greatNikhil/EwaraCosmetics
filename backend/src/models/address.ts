import mongoose, { Document, Schema } from "mongoose";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  lastname?: string;
  address: string;
  phone: string;
  pincode: string;
  flat?: string;
  city: string;
  state: string;
  default: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    flat: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    default: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ user: 1, default: 1 });

const Address =
  mongoose.models.Address ||
  mongoose.model<IAddress>("Address", addressSchema);

export default Address;
