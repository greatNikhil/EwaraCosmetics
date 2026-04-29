import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface ICoupon {
  id?: number;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CouponCreationAttributes extends Optional<ICoupon, "id"> {}

export class Coupon extends Model<ICoupon, CouponCreationAttributes> implements ICoupon {
  declare id: number;
  declare code: string;
  declare type: "percent" | "flat";
  declare value: number;
  declare minOrderAmount: number;
  declare isActive: boolean;
  declare maxUses: number | null;
  declare usedCount: number;
  declare expiresAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Coupon.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM("percent", "flat"),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    maxUses: {
      type: DataTypes.INTEGER,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    expiresAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "coupons",
    timestamps: true,
  }
);

export default Coupon;
