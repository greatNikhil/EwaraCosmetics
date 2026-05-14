import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IRefund {
  id?: number;
  user: number;
  order: number;
  returnRequest?: number;
  amount: number;
  reason: string;
  status: "Pending" | "Processing" | "Completed" | "Failed" | "Cancelled";
  refundMethod: "Original Payment" | "Bank Transfer" | "Store Credit";
  refundDetails?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RefundCreationAttributes
  extends Optional<
    IRefund,
    "id" | "returnRequest" | "refundDetails" | "processedAt"
  > {}

export class Refund
  extends Model<IRefund, RefundCreationAttributes>
  implements IRefund
{
  declare id: number;
  declare user: number;
  declare order: number;
  declare returnRequest: number;
  declare amount: number;
  declare reason: string;
  declare status: "Pending" | "Processing" | "Completed" | "Failed" | "Cancelled";
  declare refundMethod: "Original Payment" | "Bank Transfer" | "Store Credit";
  declare refundDetails: string;
  declare processedAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Refund.init(
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
    returnRequest: {
      type: DataTypes.INTEGER,
      references: {
        model: "return_requests",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Processing", "Completed", "Failed", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },
    refundMethod: {
      type: DataTypes.ENUM("Original Payment", "Bank Transfer", "Store Credit"),
      allowNull: false,
      defaultValue: "Original Payment",
    },
    refundDetails: {
      type: DataTypes.TEXT,
      comment: "Additional details about the refund (e.g., transaction ID, bank details)",
    },
    processedAt: {
      type: DataTypes.DATE,
      comment: "Timestamp when refund was processed",
    },
  },
  {
    sequelize,
    modelName: "Refund",
    tableName: "refunds",
    timestamps: true,
  }
);

export default Refund;
