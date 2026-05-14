import dotenv from "dotenv";
import { DataTypes, Sequelize } from "sequelize";
import { logError, logInfo } from "../utils/logger";

// Models import this module during startup, so load env here before
// constructing the shared Sequelize instance.
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT as string) || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logInfo("MySQL connected successfully");
    
    // Sync all models (create new tables only, don't alter existing ones)
    await sequelize.sync({ alter: false });
    const queryInterface = sequelize.getQueryInterface();
    const userTable = await queryInterface.describeTable("users");

    if (!("avatar_url" in userTable)) {
      await queryInterface.addColumn("users", "avatar_url", {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      });
      logInfo("Added users.avatar_url column");
    }

    logInfo("Database models synced");
  } catch (error) {
    logError("DB connection failed:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
export default connectDB;
