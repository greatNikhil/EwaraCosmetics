import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import {
  getAllowedOrigins,
  isDevelopmentOriginAllowed,
  validateEnv,
} from "./config/env";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import addressRoutes from "./routes/address.routes";
import couponRoutes from "./routes/coupon.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import promoRoutes from "./routes/promo.routes";
import offerRoutes from "./routes/offer.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import cartRoutes from "./routes/cart.routes";
import userRoutes from "./routes/user.routes";
import newsletterRoutes from "./routes/newsletter.routes";
import emailTestRoutes from "./routes/emailTest";
import exchangeRoutes from "./routes/exchange.routes";
import returnRoutes from "./routes/return.routes";
import refundRoutes from "./routes/refund.routes";
import refundRequestRoutes from "./routes/refundRequest.routes";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { logInfo } from "./utils/logger";

// Import models to ensure they're registered
import RefundRequest from "./models/RefundRequest";

dotenv.config();
validateEnv();

const app = express();
const allowedOrigins = getAllowedOrigins();

app.set("trust proxy", 1);
app.disable("x-powered-by");

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        isDevelopmentOriginAllowed(normalizedOrigin)
      ) {
        callback(null, true);
        return;
      }

      console.error(`CORS rejected origin: ${normalizedOrigin}`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Backend running successfully" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user", userRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/email-test", emailTestRoutes);
app.use("/api/exchanges", exchangeRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/refund-requests", refundRequestRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logInfo("========================================");
    logInfo("Ewara Cosmetics API Server");
    logInfo("========================================");
    logInfo(`Server running on port ${PORT}`);
    logInfo(`Environment: ${process.env.NODE_ENV || "development"}`);
    logInfo(`API URL: http://localhost:${PORT}`);
    logInfo(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
    logInfo("========================================");
  });
};

startServer().catch((error) => {
  console.error("SERVER STARTUP FAILED:", error);
  process.exit(1);
});
