import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IExchangeRequest {
  id?: number;
  user: number;
  order: number;
  productId: number;
  reason: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected" | "Exchanged";
  replacementProduct?: number;
  trackingNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExchangeRequestCreationAttributes
  extends Optional<IExchangeRequest, "id" | "replacementProduct" | "trackingNumber"> {}

export class ExchangeRequest
  extends Model<IExchangeRequest, ExchangeRequestCreationAttributes>
  implements IExchangeRequest
{
  declare id: number;
  declare user: number;
  declare order: number;
  declare productId: number;
  declare reason: string;
  declare description: string;
  declare status: "Pending" | "Approved" | "Rejected" | "Exchanged";
  declare replacementProduct: number;
  declare trackingNumber: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ExchangeRequest.init(
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
      comment: "Reason for exchange (e.g., Wrong Size, Defective, Changed Mind)",
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Exchanged"),
      allowNull: false,
      defaultValue: "Pending",
    },
    replacementProduct: {
      type: DataTypes.INTEGER,
      references: {
        model: "products",
        key: "id",
      },
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
    },
  },
  {
    sequelize,
    modelName: "ExchangeRequest",
    tableName: "exchange_requests",
    timestamps: true,
  }
);

export default ExchangeRequest;
