import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IAddress {
  id?: number;
  user: number;
  name: string;
  lastname?: string;
  address: string;
  phone: string;
  pincode: string;
  flat?: string;
  city: string;
  state: string;
  default: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AddressCreationAttributes extends Optional<IAddress, "id"> {}

export class Address extends Model<IAddress, AddressCreationAttributes> implements IAddress {
  declare id: number;
  declare user: number;
  declare name: string;
  declare lastname: string;
  declare address: string;
  declare phone: string;
  declare pincode: string;
  declare flat: string;
  declare city: string;
  declare state: string;
  declare default: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Address.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    flat: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "addresses",
    timestamps: true,
    indexes: [
      { fields: ["user", "default"] },
    ],
  }
);

export default Address;
