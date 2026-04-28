import { Request, Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.model";
import Product from "../models/Product";
import User from "../models/user";
import {
  sendOrderConfirmationEmail,
  sendOrderDeliveredEmail,
  sendOrderShippedEmail,
  sendPaymentFailedEmail,
  sendPaymentSuccessEmail,
} from "../utils/emailService";
import { incrementCouponUsage, resolveCouponDiscount } from "../utils/coupon";

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
      couponCode,
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

    const sanitizedItems = [];
    let subtotalAmount = 0;

    // 1. Validate products, stock, and compute authoritative subtotal
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

      sanitizedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || item.image || "/favicon/product.jpeg",
      });

      subtotalAmount += product.price * item.quantity;
    }

    const { coupon, discountAmount } = await resolveCouponDiscount({
      code: couponCode,
      subtotal: subtotalAmount,
    });

    const shippingAmount =
      paymentMethod && paymentMethod.toLowerCase().includes("cash") ? 50 : 0;
    const gstAmount = Math.round((subtotalAmount - discountAmount) * 0.18);
    const finalTotalAmount =
      subtotalAmount - discountAmount + gstAmount + shippingAmount;

    if (Math.abs(Number(totalAmount) - finalTotalAmount) > 1) {
      return res.status(400).json({
        success: false,
        message: "Order total mismatch. Please refresh and try again.",
        totals: {
          subtotalAmount,
          discountAmount,
          gstAmount,
          shippingAmount,
          totalAmount: finalTotalAmount,
        },
      });
    }

    // 2. Reduce stock
    for (const item of sanitizedItems) {
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

    const currentUser = req.user?.id ? await User.findById(req.user.id) : null;

    // 3. Create order
    const order = await Order.create({
      user: req.user?.id || undefined,
      items: sanitizedItems,
      subtotalAmount,
      couponCode: coupon?.code || undefined,
      discountAmount,
      gstAmount,
      shippingAmount,
      totalAmount: finalTotalAmount,
      paymentMethod: paymentMethod || "COD",
      shippingAddress: shippingAddress || undefined,
      status: razorpayPaymentId ? "Processing" : "Pending", // Paid orders go to Processing
      paymentStatus: razorpayPaymentId ? "Completed" : "Pending",
      razorpayPaymentId: razorpayPaymentId || undefined,
      razorpayOrderId: razorpayOrderId || undefined,
    });

    if (coupon?.code) {
      await incrementCouponUsage(coupon.code);
    }

    // Send Order Confirmation Email
    const customerEmail = currentUser?.email;
    const customerName = currentUser?.name || "Valued Customer";

    if (customerEmail) {
      await sendOrderConfirmationEmail(customerEmail, {
        ...order.toObject(),
        customerName,
      });
    }

    // Send Payment Success Email (if paid)
    if (razorpayPaymentId && customerEmail) {
      await sendPaymentSuccessEmail(customerEmail, {
        customerName,
        orderId: order._id.toString(),
        amount: finalTotalAmount,
        paymentMethod: "Razorpay",
        transactionId: razorpayPaymentId,
        customerEmail,
        items: sanitizedItems,
        shippingAddress: shippingAddress || undefined,
        subtotalAmount,
        discountAmount,
        gstAmount,
        shippingAmount,
        createdAt: order.createdAt,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);

    const message = error.message || "Failed to create order";
    const knownValidationError =
      message === "Invalid coupon" ||
      message === "Coupon has expired" ||
      message === "Coupon limit reached" ||
      message.startsWith("Minimum order amount is Rs.");

    if (knownValidationError) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message,
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

// NOTIFY PAYMENT FAILURE
export const notifyPaymentFailure = async (req: any, res: Response) => {
  try {
    const { amount, reason, razorpayOrderId } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const currentUser = await User.findById(req.user.id).select("name email");

    if (!currentUser?.email) {
      return res.status(404).json({
        success: false,
        message: "User email not found",
      });
    }

    await sendPaymentFailedEmail(currentUser.email, {
      customerName: currentUser.name || "Valued Customer",
      orderId: razorpayOrderId || "PAYMENT-ATTEMPT",
      amount: Number(amount),
      reason: reason || "Payment could not be processed",
      retryLink: `${appUrl}/cart`,
    });

    return res.status(200).json({
      success: true,
      message: "Payment failure email sent",
    });
  } catch (error: any) {
    console.error("NOTIFY PAYMENT FAILURE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process payment failure",
    });
  }
};

// UPDATE PAYMENT STATUS (ADMIN)
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus, reason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = ["Pending", "Completed", "Failed", "Refunded"];

    if (!paymentStatus || !allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await Order.findById(id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldPaymentStatus = order.paymentStatus;
    order.paymentStatus = paymentStatus;
    await order.save();

    const customer = order.user as any;
    const customerEmail = customer?.email;
    const customerName = customer?.name || "Valued Customer";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (
      customerEmail &&
      oldPaymentStatus !== paymentStatus &&
      paymentStatus === "Failed"
    ) {
      await sendPaymentFailedEmail(customerEmail, {
        customerName,
        orderId: order._id.toString(),
        amount: order.totalAmount,
        reason: reason || "Payment verification failed",
        retryLink: `${appUrl}/orders/${order._id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error: any) {
    console.error("UPDATE PAYMENT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update payment status",
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

    const populatedOrder = await order.populate("user", "name email");
    const customer = populatedOrder.user as any;
    const customerEmail = customer?.email;
    const customerName = customer?.name || "Valued Customer";
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (customerEmail && oldStatus !== status) {
      if (status === "Shipped") {
        const trackingNumber =
          order.razorpayOrderId || `EW${order._id.toString().slice(-8).toUpperCase()}`;

        await sendOrderShippedEmail(customerEmail, {
          customerName,
          orderId: order._id.toString(),
          trackingNumber,
          trackingUrl: `${appUrl}/orders/${order._id}`,
          estimatedDelivery: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
          ).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          carrier: "Ewara Delivery",
        });
      }

      if (status === "Delivered") {
        await sendOrderDeliveredEmail(customerEmail, {
          customerName,
          orderId: order._id.toString(),
          deliveryDate: new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          feedbackLink: `${appUrl}/services`,
        });
      }
    }

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
