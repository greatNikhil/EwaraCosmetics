import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IProduct {
  id?: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  countInStock: number;
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
  showInNewArrivals: boolean;
  rating?: number;
  numReviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCreationAttributes extends Optional<IProduct, "id" | "rating" | "numReviews"> {}


export class Product extends Model<IProduct, ProductCreationAttributes> implements IProduct {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare description: string;
  declare shortDescription: string;
  declare brand: string;
  declare category: string;
  declare price: number;
  declare originalPrice: number;
  declare discountPercent: number;
  declare countInStock: number;
  declare images: string[];
  declare isFeatured: boolean;
  declare isPublished: boolean;
  declare showInNewArrivals: boolean;
  declare rating: number;
  declare numReviews: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortDescription: {
      type: DataTypes.STRING(300),
      defaultValue: "",
    },
    brand: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discountPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    countInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("images");
        return typeof value === "string" ? JSON.parse(value) : value;
      },
      set(value: string | string[]) {
        this.setDataValue(
          "images",
          (typeof value === "string" ? value : JSON.stringify(value)) as any
        );
      },
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    showInNewArrivals: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    numReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
    indexes: [
      { fields: ["slug"], unique: true },
      { fields: ["category"] },
      { fields: ["brand"] },
      { fields: ["is_featured"] },
      { fields: ["is_published"] },
      { fields: ["show_in_new_arrivals"] },
      { fields: ["created_at"] },
    ],
  }
);

export default Product;
