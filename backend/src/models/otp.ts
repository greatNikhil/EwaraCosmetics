import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IOtp {
  id?: number;
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OtpCreationAttributes extends Optional<IOtp, "id"> {}

export class Otp extends Model<IOtp, OtpCreationAttributes> implements IOtp {
  declare id: number;
  declare email: string;
  declare otp: string;
  declare expiresAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "otps",
    timestamps: true,
  }
);

export default Otp;