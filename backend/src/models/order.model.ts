import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface IOrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder {
  id?: number;
  user?: number;
  items: IOrderItem[];
  subtotalAmount: number;
  couponCode?: string;
  discountAmount: number;
  gstAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingAddress?: IShippingAddress;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  stockRestored: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<IOrder, "id"> {}

export class Order extends Model<IOrder, OrderCreationAttributes> implements IOrder {
  declare id: number;
  declare user: number;
  declare items: IOrderItem[];
  declare subtotalAmount: number;
  declare couponCode: string;
  declare discountAmount: number;
  declare gstAmount: number;
  declare shippingAmount: number;
  declare totalAmount: number;
  declare paymentMethod: string;
  declare paymentStatus: string;
  declare status: string;
  declare shippingAddress: IShippingAddress;
  declare razorpayPaymentId: string;
  declare razorpayOrderId: string;
  declare stockRestored: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    subtotalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    couponCode: {
      type: DataTypes.STRING(50),
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    gstAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      defaultValue: "COD",
    },
    paymentStatus: {
      type: DataTypes.STRING(50),
      defaultValue: "Pending",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Pending",
    },
    shippingAddress: {
      type: DataTypes.JSON,
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(255),
    },
    razorpayOrderId: {
      type: DataTypes.STRING(255),
    },
    stockRestored: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
  }
);

export default Order;
