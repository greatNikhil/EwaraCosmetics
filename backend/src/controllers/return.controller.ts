import { Request, Response } from "express";
import ReturnRequest from "../models/ReturnRequest";
import Order from "../models/order.model";
import Product from "../models/Product";
import User from "../models/user";
import { sendReturnRequestEmail, sendReturnApprovedEmail } from "../utils/emailService";
import { logError } from "../utils/logger";

const serializeModel = <T extends { get: (options?: unknown) => any }>(model: T) => {
  const plain = model.get({ plain: true });
  return { ...plain, _id: plain.id };
};

export const createReturnRequest = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const { orderId, productId, reason, description } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Only reason is required - orderId and productId are auto-fetched
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findByPk(orderId);
    if (!order || order.user !== userId) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // If productId not provided, use first product from order
    let finalProductId = productId;
    if (!finalProductId && order.items && order.items.length > 0) {
      finalProductId = order.items[0]?.productId || order.items[0]?.id;
    }

    if (!finalProductId) {
      return res.status(400).json({
        success: false,
        message: "No product found in order",
      });
    }

    // Verify product exists
    const product = await Product.findByPk(finalProductId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Create return request
    const returnRequest = await ReturnRequest.create({
      user: userId,
      order: orderId,
      productId: finalProductId,
      reason,
      description,
      status: "Pending",
    });

    // Send email notification (non-blocking)
    const user = await User.findByPk(userId);
    if (user?.email) {
      sendReturnRequestEmail(user.email, {
        customerName: user.name || "Valued Customer",
        orderId: String(orderId),
        productName: product.name,
        reason,
        requestDate: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        requestId: String(returnRequest.id),
      }).catch((err) => {
        logError("Failed to send return request email:", err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: "Return request created successfully",
      return: serializeModel(returnRequest),
    });
  } catch (error: any) {
    logError("CREATE RETURN REQUEST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create return request",
    });
  }
};

export const getMyReturnRequests = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const returns = await ReturnRequest.findAll({
      where: { user: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: returns.length,
      returns: returns.map((returnReq) => serializeModel(returnReq)),
    });
  } catch (error: any) {
    logError("GET MY RETURN REQUESTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch return requests",
    });
  }
};

export const getReturnRequestById = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const returnId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!returnId || Number.isNaN(returnId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return request ID",
      });
    }

    const returnRequest = await ReturnRequest.findByPk(returnId);

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (returnRequest.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      return: serializeModel(returnRequest),
    });
  } catch (error: any) {
    logError("GET RETURN REQUEST BY ID ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch return request",
    });
  }
};

export const updateReturnStatus = async (req: any, res: Response) => {
  try {
    const returnId = Number(req.params.id);
    const { status, refundAmount, trackingNumber } = req.body;

    if (!returnId || Number.isNaN(returnId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return request ID",
      });
    }

    if (!status || !["Pending", "Approved", "Rejected", "Returned", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (Pending, Approved, Rejected, Returned, Completed)",
      });
    }

    const returnRequest = await ReturnRequest.findByPk(returnId);

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Update return request
    await returnRequest.update({
      status,
      refundAmount: refundAmount || returnRequest.refundAmount,
      trackingNumber: trackingNumber || returnRequest.trackingNumber,
    });

    // Send approval email if status changed to Completed
    if (status === "Completed") {
      const user = await User.findByPk(returnRequest.user);
      const product = await Product.findByPk(returnRequest.productId);

      if (user?.email && product) {
        sendReturnApprovedEmail(user.email, {
          customerName: user.name || "Valued Customer",
          orderId: String(returnRequest.order),
          productName: product.name,
          requestDate: new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          requestId: String(returnRequest.id),
          trackingNumber: trackingNumber,
        }).catch((err) => {
          logError("Failed to send return approved email:", err.message);
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Return request status updated successfully",
      return: serializeModel(returnRequest),
    });
  } catch (error: any) {
    logError("UPDATE RETURN STATUS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update return request status",
    });
  }
};

export const getAllReturnRequests = async (req: any, res: Response) => {
  try {
    const { status, userId } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (userId) whereClause.user = Number(userId);

    const returns = await ReturnRequest.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: returns.length,
      returns: returns.map((returnReq) => serializeModel(returnReq)),
    });
  } catch (error: any) {
    logError("GET ALL RETURN REQUESTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch return requests",
    });
  }
};
