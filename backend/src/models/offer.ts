import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IOffer {
  id?: number;
  text: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OfferCreationAttributes extends Optional<IOffer, "id"> {}

export class Offer extends Model<IOffer, OfferCreationAttributes> implements IOffer {
  declare id: number;
  declare text: string;
  declare isActive: boolean;
  declare displayOrder: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Offer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "offers",
    timestamps: true,
    indexes: [
      { fields: ["is_active", "display_order", "created_at"] },
    ],
  }
);

export default Offer;
