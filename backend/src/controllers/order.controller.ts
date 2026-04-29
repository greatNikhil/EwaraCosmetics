import { Request, Response } from "express";
import crypto from "crypto";
import { sequelize } from "../config/db";
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

const serializeModel = <T extends { get: (options?: unknown) => any }>(model: T) => {
  const plain = model.get({ plain: true });
  return { ...plain, _id: plain.id };
};

const serializeUser = (user: User | null) => {
  if (!user) return null;
  const plain = user.get({ plain: true });
  return {
    ...plain,
    _id: plain.id,
  };
};

const serializeOrderWithUser = (order: Order, user?: User | null) => {
  const plain = order.get({ plain: true });

  return {
    ...plain,
    _id: plain.id,
    user: user ? serializeUser(user) : plain.user,
  };
};

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

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required",
      });
    }

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

    const sanitizedItems: Array<{
      productId: number;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }> = [];
    let subtotalAmount = 0;

    await sequelize.transaction(async (transaction) => {
      for (const item of items) {
        const productId = Number(item.productId);

        if (!productId || Number.isNaN(productId)) {
          throw new Error("Invalid product ID in order items");
        }

        if (!item.quantity || Number(item.quantity) <= 0) {
          throw new Error("Invalid quantity in order items");
        }

        const product = await Product.findByPk(productId, { transaction });

        if (!product) {
          const error: any = new Error(`Product not found for ID: ${item.productId}`);
          error.statusCode = 404;
          throw error;
        }

        if (!product.isPublished) {
          throw new Error(`${product.name} is not available for purchase`);
        }

        if (product.countInStock < Number(item.quantity)) {
          throw new Error(
            `Insufficient stock for ${product.name}. Only ${product.countInStock} left.`
          );
        }

        sanitizedItems.push({
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: Number(item.quantity),
          image: product.images?.[0] || item.image || "/favicon/product.jpeg",
        });

        subtotalAmount += Number(product.price) * Number(item.quantity);
      }

      const { coupon, discountAmount } = await resolveCouponDiscount({
        code: couponCode,
        subtotal: subtotalAmount,
      });

      const shippingAmount =
        paymentMethod && String(paymentMethod).toLowerCase().includes("cash") ? 50 : 0;
      const gstAmount = Math.round((subtotalAmount - discountAmount) * 0.18);
      const finalTotalAmount =
        subtotalAmount - discountAmount + gstAmount + shippingAmount;

      if (Math.abs(Number(totalAmount) - finalTotalAmount) > 1) {
        const error: any = new Error("Order total mismatch. Please refresh and try again.");
        error.statusCode = 400;
        error.payload = {
          totals: {
            subtotalAmount,
            discountAmount,
            gstAmount,
            shippingAmount,
            totalAmount: finalTotalAmount,
          },
        };
        throw error;
      }

      for (const item of sanitizedItems) {
        const product = await Product.findByPk(item.productId, { transaction });

        if (!product) {
          const error: any = new Error(`Product not found for stock update: ${item.productId}`);
          error.statusCode = 404;
          throw error;
        }

        product.countInStock -= item.quantity;
        await product.save({ transaction });
      }

      const currentUser = req.user?.id
        ? await User.findByPk(Number(req.user.id), { transaction })
        : null;

      const order = await Order.create(
        {
          user: req.user?.id ? Number(req.user.id) : undefined,
          items: sanitizedItems,
          subtotalAmount,
          couponCode: coupon?.code || undefined,
          discountAmount,
          gstAmount,
          shippingAmount,
          totalAmount: finalTotalAmount,
          paymentMethod: paymentMethod || "COD",
          shippingAddress: shippingAddress || undefined,
          status: razorpayPaymentId ? "Processing" : "Pending",
          paymentStatus: razorpayPaymentId ? "Completed" : "Pending",
          razorpayPaymentId: razorpayPaymentId || undefined,
          razorpayOrderId: razorpayOrderId || undefined,
        },
        { transaction }
      );

      if (coupon?.code) {
        await incrementCouponUsage(coupon.code, transaction);
      }

      const customerEmail = currentUser?.email;
      const customerName = currentUser?.name || "Valued Customer";

      if (customerEmail) {
        await sendOrderConfirmationEmail(customerEmail, {
          ...serializeModel(order),
          customerName,
        });
      }

      if (razorpayPaymentId && customerEmail) {
        await sendPaymentSuccessEmail(customerEmail, {
          customerName,
          orderId: String(order.id),
          amount: finalTotalAmount,
          paymentMethod: paymentMethod || "Razorpay",
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
        order: serializeModel(order),
      });
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);

    const message = error.message || "Failed to create order";
    const knownValidationError =
      message === "Invalid coupon" ||
      message === "Coupon has expired" ||
      message === "Coupon limit reached" ||
      message === "Invalid product ID in order items" ||
      message === "Invalid quantity in order items" ||
      message.startsWith("Minimum order amount is Rs.") ||
      message.includes("is not available for purchase") ||
      message.startsWith("Insufficient stock for") ||
      message === "Order total mismatch. Please refresh and try again.";

    return res.status(error.statusCode || (knownValidationError ? 400 : 500)).json({
      success: false,
      message,
      ...(error.payload || {}),
    });
  }
};

export const getMyOrders = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const orders = await Order.findAll({
      where: { user: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map((order) => serializeModel(order)),
    });
  } catch (error: any) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your orders",
    });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });
    const userIds = Array.from(
      new Set(orders.map((order) => order.user).filter((userId) => Boolean(userId)))
    );
    const users = userIds.length
      ? await User.findAll({
          where: { id: userIds },
          attributes: ["id", "name", "email"],
        })
      : [];
    const userMap = new Map(users.map((user) => [user.id, user]));

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map((order) => serializeOrderWithUser(order, userMap.get(order.user) || null)),
    });
  } catch (error: any) {
    console.error("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

export const getOrderById = async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);

    if (!orderId || Number.isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const currentUserId = Number(req.user?.id);
    const currentUserRole = req.user?.role;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const orderUser = order.user ? await User.findByPk(order.user) : null;

    if (currentUserRole !== "admin" && order.user !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      order: serializeOrderWithUser(order, orderUser),
    });
  } catch (error: any) {
    console.error("GET ORDER BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

export const notifyPaymentFailure = async (req: any, res: Response) => {
  try {
    const { amount, reason, razorpayOrderId } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const currentUser = await User.findByPk(Number(req.user.id), {
      attributes: ["id", "name", "email"],
    });

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

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { paymentStatus, reason } = req.body;

    if (!orderId || Number.isNaN(orderId)) {
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

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldPaymentStatus = order.paymentStatus;
    order.paymentStatus = paymentStatus;
    await order.save();

    const customer = order.user ? await User.findByPk(order.user) : null;
    const customerEmail = customer?.email;
    const customerName = customer?.name || "Valued Customer";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (
      customerEmail &&
      oldPaymentStatus !== paymentStatus &&
      paymentStatus === "Failed"
    ) {
      await sendPaymentFailedEmail(customerEmail, {
        customerName,
        orderId: String(order.id),
        amount: Number(order.totalAmount),
        reason: reason || "Payment verification failed",
        retryLink: `${appUrl}/orders/${order.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order: serializeModel(order),
    });
  } catch (error: any) {
    console.error("UPDATE PAYMENT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update payment status",
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!orderId || Number.isNaN(orderId)) {
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

    const result = await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(orderId, { transaction });

      if (!order) {
        const error: any = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      const oldStatus = order.status;

      if (status === "Cancelled" && oldStatus !== "Cancelled" && !order.stockRestored) {
        for (const item of order.items) {
          const product = await Product.findByPk(Number(item.productId), { transaction });

          if (!product) {
            const error: any = new Error(`Product not found for ID: ${item.productId}`);
            error.statusCode = 404;
            throw error;
          }

          product.countInStock += Number(item.quantity);
          await product.save({ transaction });
        }

        order.stockRestored = true;
      }

      order.status = status;
      await order.save({ transaction });

      return { order, oldStatus };
    });

    const customer = result.order.user ? await User.findByPk(result.order.user) : null;
    const customerEmail = customer?.email;
    const customerName = customer?.name || "Valued Customer";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (customerEmail && result.oldStatus !== status) {
      if (status === "Shipped") {
        const trackingNumber =
          result.order.razorpayOrderId ||
          `EW${String(result.order.id).slice(-8).toUpperCase()}`;

        await sendOrderShippedEmail(customerEmail, {
          customerName,
          orderId: String(result.order.id),
          trackingNumber,
          trackingUrl: `${appUrl}/orders/${result.order.id}`,
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
          orderId: String(result.order.id),
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
      order: serializeModel(result.order),
    });
  } catch (error: any) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};
