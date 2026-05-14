import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IReturnRequest {
  id?: number;
  user: number;
  order: number;
  productId: number;
  reason: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected" | "Returned" | "Completed";
  refundAmount?: number;
  trackingNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReturnRequestCreationAttributes
  extends Optional<
    IReturnRequest,
    "id" | "refundAmount" | "trackingNumber"
  > {}

export class ReturnRequest
  extends Model<IReturnRequest, ReturnRequestCreationAttributes>
  implements IReturnRequest
{
  declare id: number;
  declare user: number;
  declare order: number;
  declare productId: number;
  declare reason: string;
  declare description: string;
  declare status: "Pending" | "Approved" | "Rejected" | "Returned" | "Completed";
  declare refundAmount: number;
  declare trackingNumber: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ReturnRequest.init(
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Reason for return (e.g., Not As Described, Defective, Changed Mind)",
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Returned", "Completed"),
      allowNull: false,
      defaultValue: "Pending",
    },
    refundAmount: {
      type: DataTypes.DECIMAL(12, 2),
      comment: "Amount to be refunded (may be less than original due to deductions)",
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
    },
  },
  {
    sequelize,
    modelName: "ReturnRequest",
    tableName: "return_requests",
    timestamps: true,
  }
);

export default ReturnRequest;
