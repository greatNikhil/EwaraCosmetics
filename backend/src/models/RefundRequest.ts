import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IRefundRequest {
  id?: number;
  user: number; // FK to User
  order: number; // FK to Order
  amount: number;
  reason: string;
  refundMethod?: string;
  status: "Pending" | "Approved" | "Rejected" | "Processed" | "Cancelled";
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RefundRequestCreationAttributes
  extends Optional<IRefundRequest, "id"> {}

export class RefundRequest
  extends Model<IRefundRequest, RefundRequestCreationAttributes>
  implements IRefundRequest
{
  declare id: number;
  declare user: number;
  declare order: number;
  declare amount: number;
  declare reason: string;
  declare refundMethod: string;
  declare status: "Pending" | "Approved" | "Rejected" | "Processed" | "Cancelled";
  declare adminNotes: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

RefundRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    refundMethod: {
      type: DataTypes.STRING(100),
      defaultValue: "Original Payment",
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Processed", "Cancelled"),
      defaultValue: "Pending",
    },
    adminNotes: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "RefundRequest",
    tableName: "refund_requests",
    timestamps: true,
  }
);

export default RefundRequest;
