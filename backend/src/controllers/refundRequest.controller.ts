import { Request, Response } from "express";
import RefundRequest from "../models/RefundRequest";
import Order from "../models/order.model";
import User from "../models/user";
import Refund from "../models/Refund";
import { sendRefundNotificationEmail } from "../utils/emailService";
import { logError, logInfo } from "../utils/logger";

const serializeModel = <T extends { get: (options?: unknown) => any }>(model: T) => {
  const plain = model.get({ plain: true });
  return { ...plain, _id: plain.id };
};

const validRefundMethods = [
  "Original Payment",
  "Bank Transfer",
  "Store Credit",
] as const;

type RefundMethod = (typeof validRefundMethods)[number];

const normalizeRefundMethod = (value: unknown): RefundMethod => {
  return validRefundMethods.includes(value as RefundMethod)
    ? (value as RefundMethod)
    : "Original Payment";
};

// USER ENDPOINTS
export const requestRefund = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { orderId, amount, reason, refundMethod } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

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

    // Verify order exists and belongs to user
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only request refund for your own orders",
      });
    }

    // Check if amount doesn't exceed order total
    if (amount > order.totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed order total (₹${order.totalAmount})`,
      });
    }

    // Create refund request
    const refundRequest = await RefundRequest.create({
      user: userId,
      order: orderId,
      amount,
      reason,
      refundMethod: refundMethod || "Original Payment",
      status: "Pending",
    });

    logInfo(`User ${userId} requested refund for order ${orderId}: ₹${amount}`);

    return res.status(201).json({
      success: true,
      message: "Refund request submitted successfully",
      refundRequest: serializeModel(refundRequest),
    });
  } catch (error: any) {
    logError("REQUEST REFUND ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to request refund",
    });
  }
};

export const getMyRefundRequests = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const refundRequests = await RefundRequest.findAll({
      where: { user: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: refundRequests.length,
      refundRequests: refundRequests.map(serializeModel),
    });
  } catch (error: any) {
    logError("GET MY REFUND REQUESTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch refund requests",
    });
  }
};

export const getRefundRequestById = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const refundRequestId = Number(req.params.id);

    if (!refundRequestId || Number.isNaN(refundRequestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund request ID",
      });
    }

    const refundRequest = await RefundRequest.findByPk(refundRequestId);

    if (!refundRequest) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found",
      });
    }

    // Verify ownership
    if (refundRequest.user !== userId && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      refundRequest: serializeModel(refundRequest),
    });
  } catch (error: any) {
    logError("GET REFUND REQUEST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch refund request",
    });
  }
};

export const cancelRefundRequest = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const refundRequestId = Number(req.params.id);

    if (!refundRequestId || Number.isNaN(refundRequestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund request ID",
      });
    }

    const refundRequest = await RefundRequest.findByPk(refundRequestId);

    if (!refundRequest) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found",
      });
    }

    if (refundRequest.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own refund requests",
      });
    }

    if (refundRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a refund request with status: ${refundRequest.status}`,
      });
    }

    await refundRequest.update({ status: "Cancelled" });

    logInfo(`User ${userId} cancelled refund request ${refundRequestId}`);

    return res.status(200).json({
      success: true,
      message: "Refund request cancelled successfully",
      refundRequest: serializeModel(refundRequest),
    });
  } catch (error: any) {
    logError("CANCEL REFUND REQUEST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel refund request",
    });
  }
};

// ADMIN ENDPOINTS
export const getAllRefundRequests = async (req: any, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const refundRequests = await RefundRequest.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: refundRequests.length,
      refundRequests: refundRequests.map(serializeModel),
    });
  } catch (error: any) {
    logError("GET ALL REFUND REQUESTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch refund requests",
    });
  }
};

export const approveRefundRequest = async (req: any, res: Response) => {
  try {
    const refundRequestId = Number(req.params.id);
    const { adminNotes } = req.body;

    if (!refundRequestId || Number.isNaN(refundRequestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund request ID",
      });
    }

    const refundRequest = await RefundRequest.findByPk(refundRequestId);

    if (!refundRequest) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found",
      });
    }

    if (refundRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Can only approve pending requests. Current status: ${refundRequest.status}`,
      });
    }

    await refundRequest.update({
      status: "Approved",
      adminNotes: adminNotes || "",
    });

    // Send approval email
    const user = await User.findByPk(refundRequest.user);
    if (user?.email) {
      const order = await Order.findByPk(refundRequest.order);
      const isInstant = order?.paymentMethod?.toLowerCase().includes("razorpay") ||
        order?.paymentMethod?.toLowerCase().includes("card") ||
        order?.paymentMethod?.toLowerCase().includes("upi");

      sendRefundNotificationEmail(user.email, {
        customerName: user.name || "Valued Customer",
        orderId: String(refundRequest.order),
        refundAmount: Number(refundRequest.amount),
        refundMethod: refundRequest.refundMethod,
        status: isInstant ? "instant" : "pending",
        processedDate: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        estimatedDelivery: isInstant ? undefined : "3 business days",
      }).catch((err) => {
        logError("Failed to send refund approval email:", err.message);
      });
    }

    logInfo(`Admin approved refund request ${refundRequestId}`);

    return res.status(200).json({
      success: true,
      message: "Refund request approved successfully",
      refundRequest: serializeModel(refundRequest),
    });
  } catch (error: any) {
    logError("APPROVE REFUND REQUEST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve refund request",
    });
  }
};

export const rejectRefundRequest = async (req: any, res: Response) => {
  try {
    const refundRequestId = Number(req.params.id);
    const { adminNotes } = req.body;

    if (!refundRequestId || Number.isNaN(refundRequestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund request ID",
      });
    }

    const refundRequest = await RefundRequest.findByPk(refundRequestId);

    if (!refundRequest) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found",
      });
    }

    if (refundRequest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Can only reject pending requests. Current status: ${refundRequest.status}`,
      });
    }

    await refundRequest.update({
      status: "Rejected",
      adminNotes: adminNotes || "",
    });

    logInfo(`Admin rejected refund request ${refundRequestId}`);

    return res.status(200).json({
      success: true,
      message: "Refund request rejected successfully",
      refundRequest: serializeModel(refundRequest),
    });
  } catch (error: any) {
    logError("REJECT REFUND REQUEST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reject refund request",
    });
  }
};

export const processApprovedRefund = async (req: any, res: Response) => {
  try {
    const refundRequestId = Number(req.params.id);

    if (!refundRequestId || Number.isNaN(refundRequestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund request ID",
      });
    }

    const refundRequest = await RefundRequest.findByPk(refundRequestId);

    if (!refundRequest) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found",
      });
    }

    if (refundRequest.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: `Only approved refund requests can be processed. Current status: ${refundRequest.status}`,
      });
    }

    // Create an actual refund in the Refund table
    const refund = await Refund.create({
      user: refundRequest.user,
      order: refundRequest.order,
      amount: refundRequest.amount,
      reason: refundRequest.reason,
      status: "Completed",
      refundMethod: normalizeRefundMethod(refundRequest.refundMethod),
      processedAt: new Date(),
    });

    // Update the refund request status
    await refundRequest.update({ status: "Processed" });

    logInfo(`Admin processed approved refund request ${refundRequestId}`);

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refund: serializeModel(refund),
    });
  } catch (error: any) {
    logError("PROCESS APPROVED REFUND ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process refund",
    });
  }
};
