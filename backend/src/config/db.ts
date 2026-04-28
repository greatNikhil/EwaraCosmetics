import mongoose from "mongoose";
import { logError, logInfo } from "../utils/logger";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    logInfo("MongoDB connected");
  } catch (error) {
    logError("DB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
