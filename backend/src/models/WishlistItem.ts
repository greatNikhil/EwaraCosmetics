import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IWishlistItem {
  id?: number;
  userId: number;
  productId: string;
  productName: string;
  price: number;
  image: string;
  category: string;
  addedAt?: Date;
}

interface WishlistItemCreationAttributes extends Optional<IWishlistItem, "id"> {}

export class WishlistItem extends Model<IWishlistItem, WishlistItemCreationAttributes> implements IWishlistItem {
  declare id: number;
  declare userId: number;
  declare productId: string;
  declare productName: string;
  declare price: number;
  declare image: string;
  declare category: string;
  declare addedAt: Date;
}

WishlistItem.init(
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
    tableName: "wishlist_items",
    timestamps: false,
    indexes: [
      { fields: ["userId", "productId"], unique: true },
      { fields: ["addedAt"] },
    ],
  }
);

export default WishlistItem;
