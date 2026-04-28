import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id?: string;
  name: string;
  lastname?: string;
  email: string;
  phone?: string | null;
  password?: string | null;
  googleId?: string;
  avatar?: string;
  role: string;
}

const userSchema = new Schema<IUser>(
  {
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
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;
