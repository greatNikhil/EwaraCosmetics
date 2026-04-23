import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import promoRoutes from "./routes/promo.routes";

dotenv.config();

// Connect database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Backend running successfully" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promo", promoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("  Ewara Cosmetics API Server");
  console.log("========================================");
  console.log(`  Server running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`  API URL: http://localhost:${PORT}`);
  console.log("========================================");
});