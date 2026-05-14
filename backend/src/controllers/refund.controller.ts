import { Request, Response } from "express";
import Refund from "../models/Refund";
import Order from "../models/order.model";
import User from "../models/user";
import { sendRefundNotificationEmail } from "../utils/emailService";
import { logError } from "../utils/logger";

const serializeModel = <T extends { get: (options?: unknown) => any }>(model: T) => {
  const plain = model.get({ plain: true });
  return { ...plain, _id: plain.id };
};

export const processRefund = async (req: any, res: Response) => {
  try {
    const { orderId, amount, reason, refundMethod, returnRequestId } = req.body;

    if (!orderId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "Order ID, amount, and reason are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Refund amount must be greater than 0",
      });
    }

    // Verify order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Create refund record
    const refund = await Refund.create({
      user: order.user,
      order: orderId,
      returnRequest: returnRequestId || undefined,
      amount,
      reason,
      status: "Processing",
      refundMethod: refundMethod || "Original Payment",
    });

    // Send refund notification email (non-blocking)
    const user = await User.findByPk(order.user);
    if (user?.email) {
      // Determine if refund is instant (Razorpay) or pending (COD, Bank Transfer)
      const isInstant = order.paymentMethod?.toLowerCase().includes("razorpay") || order.paymentMethod?.toLowerCase().includes("card") || order.paymentMethod?.toLowerCase().includes("upi");

      sendRefundNotificationEmail(user.email, {
        customerName: user.name || "Valued Customer",
        orderId: String(orderId),
        refundAmount: Number(amount),
        refundMethod: refundMethod || "Original Payment",
        status: isInstant ? "instant" : "pending",
        processedDate: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        estimatedDelivery: isInstant ? undefined : "3 business days",
      }).catch((err) => {
        logError("Failed to send refund notification email:", err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: "Refund processed successfully",
      refund: serializeModel(refund),
    });
  } catch (error: any) {
    logError("PROCESS REFUND ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process refund",
    });
  }
};

export const completeRefund = async (req: any, res: Response) => {
  try {
    const refundId = Number(req.params.id);
    const { transactionId, refundDetails } = req.body;

    if (!refundId || Number.isNaN(refundId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund ID",
      });
    }

    const refund = await Refund.findByPk(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    // Update refund
    await refund.update({
      status: "Completed",
      refundDetails: refundDetails || refund.refundDetails,
      processedAt: new Date(),
    });

    // Send completion email (non-blocking)
    const user = await User.findByPk(refund.user);
    const order = await Order.findByPk(refund.order);
    
    if (user?.email && order) {
      const isInstant = order.paymentMethod?.toLowerCase().includes("razorpay") || 
                       order.paymentMethod?.toLowerCase().includes("card") || 
                       order.paymentMethod?.toLowerCase().includes("upi");

      sendRefundNotificationEmail(user.email, {
        customerName: user.name || "Valued Customer",
        orderId: String(refund.order),
        refundAmount: Number(refund.amount),
        refundMethod: refund.refundMethod || "Original Payment",
        status: isInstant ? "instant" : "pending",
        processedDate: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        estimatedDelivery: isInstant ? undefined : "3 business days",
      }).catch((err) => {
        logError("Failed to send refund completion email:", err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Refund marked as completed successfully",
      refund: serializeModel(refund),
    });
  } catch (error: any) {
    logError("COMPLETE REFUND ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to complete refund",
    });
  }
};

export const getRefundById = async (req: any, res: Response) => {
  try {
    const refundId = Number(req.params.id);

    if (!refundId || Number.isNaN(refundId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund ID",
      });
    }

    const refund = await Refund.findByPk(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    return res.status(200).json({
      success: true,
      refund: serializeModel(refund),
    });
  } catch (error: any) {
    logError("GET REFUND BY ID ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch refund",
    });
  }
};

export const getMyRefunds = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const refunds = await Refund.findAll({
      where: { user: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: refunds.length,
      refunds: refunds.map((refund) => serializeModel(refund)),
    });
  } catch (error: any) {
    logError("GET MY REFUNDS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch refunds",
    });
  }
};

export const getAllRefunds = async (req: any, res: Response) => {
  try {
    const { status, userId, orderId } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (userId) whereClause.user = Number(userId);
    if (orderId) whereClause.order = Number(orderId);

    const refunds = await Refund.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: refunds.length,
      refunds: refunds.map((refund) => serializeModel(refund)),
    });
  } catch (error: any) {
    logError("GET ALL REFUNDS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch refunds",
    });
  }
};

export const failRefund = async (req: any, res: Response) => {
  try {
    const refundId = Number(req.params.id);
    const { reason } = req.body;

    if (!refundId || Number.isNaN(refundId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund ID",
      });
    }

    const refund = await Refund.findByPk(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    // Update refund status to failed
    await refund.update({
      status: "Failed",
      refundDetails: reason || refund.refundDetails,
    });

    return res.status(200).json({
      success: true,
      message: "Refund marked as failed",
      refund: serializeModel(refund),
    });
  } catch (error: any) {
    logError("FAIL REFUND ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update refund status",
    });
  }
};

// Send refund notification email for existing refund (admin triggered)
export const sendRefundNotificationManual = async (req: any, res: Response) => {
  try {
    const refundId = Number(req.params.id);

    if (!refundId || Number.isNaN(refundId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund ID",
      });
    }

    const refund = await Refund.findByPk(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    const user = await User.findByPk(refund.user);
    const order = await Order.findByPk(refund.order);

    if (!user?.email) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }

    // Determine if refund is instant or pending
    const isInstant = order?.paymentMethod?.toLowerCase().includes("razorpay") ||
      order?.paymentMethod?.toLowerCase().includes("card") ||
      order?.paymentMethod?.toLowerCase().includes("upi");

    // Send email
    await sendRefundNotificationEmail(user.email, {
      customerName: user.name || "Valued Customer",
      orderId: String(refund.order),
      refundAmount: Number(refund.amount),
      refundMethod: refund.refundMethod || "Original Payment",
      status: isInstant ? "instant" : "pending",
      processedDate: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      estimatedDelivery: isInstant ? undefined : "3 business days",
    });

    return res.status(200).json({
      success: true,
      message: "Refund notification email sent successfully",
      refund: serializeModel(refund),
    });
  } catch (error: any) {
    logError("SEND REFUND NOTIFICATION ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send refund notification email",
    });
  }
};
