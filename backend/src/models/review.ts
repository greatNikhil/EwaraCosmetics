import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IReview {
  id?: number;
  product: number;
  user: number;
  name: string;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<IReview, "id"> {}

export class Review extends Model<IReview, ReviewCreationAttributes> implements IReview {
  declare id: number;
  declare product: number;
  declare user: number;
  declare name: string;
  declare rating: number;
  declare comment: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "reviews",
    timestamps: true,
    indexes: [
      { fields: ["product"] },
      { fields: ["user"] },
      { fields: ["product", "user"], unique: true },
      { fields: ["created_at"] },
    ],
  }
);

export default Review;
