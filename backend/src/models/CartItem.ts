import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface ICartItem {
  id?: number;
  userId: number;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  addedAt?: Date;
}

interface CartItemCreationAttributes extends Optional<ICartItem, "id"> {}

export class CartItem extends Model<ICartItem, CartItemCreationAttributes> implements ICartItem {
  declare id: number;
  declare userId: number;
  declare productId: string;
  declare productName: string;
  declare price: number;
  declare quantity: number;
  declare image: string;
  declare category: string;
  declare addedAt: Date;
}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "cart_items",
    timestamps: false,
    indexes: [
      { fields: ["user_id", "product_id"], unique: true },
      { fields: ["added_at"] },
    ],
  }
);

export default CartItem;
