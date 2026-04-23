import { Request, Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.model";
import Product from "../models/Product";
import {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
} from "../utils/emailService";

// VERIFY RAZORPAY SIGNATURE
const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keySecret) {
    console.error("RAZORPAY_KEY_SECRET not found in environment");
    return false;
  }

  const message = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(message)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

// CREATE ORDER
export const createOrder = async (req: any, res: Response) => {
  try {
    const {
      items,
      totalAmount,
      paymentMethod,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      shippingAddress,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required",
      });
    }

    // Verify Razorpay payment if provided
    if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const isSignatureValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isSignatureValid) {
        return res.status(400).json({
          success: false,
          message: "Razorpay payment signature verification failed",
        });
      }
    }

    // 1. Validate products and stock
    for (const item of items) {
      if (!item.productId || !mongoose.isValidObjectId(item.productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID in order items",
        });
      }

      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity in order items",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for ID: ${item.productId}`,
        });
      }

      if (!product.isPublished) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is not available for purchase`,
        });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.countInStock} left.`,
        });
      }
    }

    // 2. Reduce stock
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for stock update: ${item.productId}`,
        });
      }

      product.countInStock -= item.quantity;
      await product.save();
    }

    // 3. Create order
    const order = await Order.create({
      user: req.user?.id || undefined,
      items,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      shippingAddress: shippingAddress || undefined,
      status: razorpayPaymentId ? "Processing" : "Pending", // Paid orders go to Processing
      paymentStatus: razorpayPaymentId ? "Completed" : "Pending",
      razorpayPaymentId: razorpayPaymentId || undefined,
      razorpayOrderId: razorpayOrderId || undefined,
    });

    // Send Order Confirmation Email
    const customerEmail = req.user?.email || "customer@email.com";
    sendOrderConfirmationEmail(customerEmail, {
      ...order.toObject(),
      customerName: req.user?.name || "Valued Customer",
    });

    // Send Payment Success Email (if paid)
    if (razorpayPaymentId) {
      sendPaymentSuccessEmail(customerEmail, {
        customerName: req.user?.name || "Valued Customer",
        orderId: order._id,
        amount: totalAmount,
        paymentMethod: "Razorpay",
        transactionId: razorpayPaymentId,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// GET MY ORDERS (LOGGED-IN USER)
export const getMyOrders = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const orders = await Order.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your orders",
    });
  }
};

// GET ALL ORDERS (ADMIN)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

// GET SINGLE ORDER BY ID
export const getOrderById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id).populate("user", "name email role");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Admin can access any order
    if (currentUserRole === "admin") {
      return res.status(200).json({
        success: true,
        order,
      });
    }

    let orderUserId: string | undefined;

    if (order.user) {
      const userValue = order.user as any;

      if (userValue._id) {
        orderUserId = userValue._id.toString();
      } else {
        orderUserId = String(userValue);
      }
    }

    if (orderUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("GET ORDER BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

// UPDATE ORDER STATUS (ADMIN)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldStatus = order.status;

    // Restore stock only once when moving to Cancelled
    if (
      status === "Cancelled" &&
      oldStatus !== "Cancelled" &&
      !order.stockRestored
    ) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found for ID: ${item.productId}`,
          });
        }

        product.countInStock += item.quantity;
        await product.save();
      }

      order.stockRestored = true;
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error: any) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};