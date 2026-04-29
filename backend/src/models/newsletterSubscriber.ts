import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export interface INewsletterSubscriber {
  id?: number;
  email: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterSubscriberCreationAttributes
  extends Optional<INewsletterSubscriber, "id" | "isActive"> {}

export class NewsletterSubscriber
  extends Model<INewsletterSubscriber, NewsletterSubscriberCreationAttributes>
  implements INewsletterSubscriber
{
  declare id: number;
  declare email: string;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

NewsletterSubscriber.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "newsletter_subscribers",
    timestamps: true,
    indexes: [{ fields: ["email"], unique: true }],
  }
);

export default NewsletterSubscriber;
