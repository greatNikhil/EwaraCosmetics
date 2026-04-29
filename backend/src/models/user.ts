import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IUser {
  id?: number;
  name: string;
  lastname?: string;
  email: string;
  phone?: string | null;
  password?: string | null;
  googleId?: string;
  avatar?: string;
  role: string;
  isBlocked?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<IUser, "id"> {}

export class User extends Model<IUser, UserCreationAttributes> implements IUser {
  declare id: number;
  declare name: string;
  declare lastname: string;
  declare email: string;
  declare phone: string | null;
  declare password: string | null;
  declare googleId: string;
  declare avatar: string;
  declare role: string;
  declare isBlocked: boolean;
  declare isDeleted: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [1, 255] },
    },
    lastname: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: "user",
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

export default User;
