import mongoose, { Document, Schema } from "mongoose";

export interface IOffer extends Document {
  text: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.index({ isActive: 1, displayOrder: 1, createdAt: -1 });

const Offer =
  mongoose.models.Offer ||
  mongoose.model<IOffer>("Offer", offerSchema);

export default Offer;
