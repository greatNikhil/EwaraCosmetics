import { Request, Response } from "express";
import ExchangeRequest from "../models/ExchangeRequest";
import Order from "../models/order.model";
import Product from "../models/Product";
import User from "../models/user";
import { sendExchangeRequestEmail } from "../utils/emailService";
import { logError } from "../utils/logger";

const serializeModel = <T extends { get: (options?: unknown) => any }>(model: T) => {
  const plain = model.get({ plain: true });
  return { ...plain, _id: plain.id };
};

export const createExchangeRequest = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const { orderId, productId, reason, description, replacementProduct } = req.body;

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

    // Create exchange request
    const exchangeRequest = await ExchangeRequest.create({
      user: userId,
      order: orderId,
      productId: finalProductId,
      reason,
      description,
      replacementProduct,
      status: "Pending",
    });

    // Send email notification (non-blocking)
    const user = await User.findByPk(userId);
    if (user?.email) {
      sendExchangeRequestEmail(user.email, {
        customerName: user.name || "Valued Customer",
        orderId: String(orderId),
        productName: product.name,
        reason,
        requestDate: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        requestId: String(exchangeRequest.id),
      }).catch((err) => {
        logError("Failed to send exchange request email:", err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: "Exchange request created successfully",
      exchange: serializeModel(exchangeRequest),
    });
  } catch (error: any) {
    logError("CREATE EXCHANGE REQUEST ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create exchange request",
    });
  }
};

export const getMyExchangeRequests = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const exchanges = await ExchangeRequest.findAll({
      where: { user: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: exchanges.length,
      exchanges: exchanges.map((exchange) => serializeModel(exchange)),
    });
  } catch (error: any) {
    logError("GET MY EXCHANGE REQUESTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exchange requests",
    });
  }
};

export const getExchangeRequestById = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const exchangeId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!exchangeId || Number.isNaN(exchangeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exchange request ID",
      });
    }

    const exchange = await ExchangeRequest.findByPk(exchangeId);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    if (exchange.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      exchange: serializeModel(exchange),
    });
  } catch (error: any) {
    logError("GET EXCHANGE REQUEST BY ID ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exchange request",
    });
  }
};

export const updateExchangeStatus = async (req: any, res: Response) => {
  try {
    const exchangeId = Number(req.params.id);
    const { status, replacementProduct, trackingNumber } = req.body;

    if (!exchangeId || Number.isNaN(exchangeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exchange request ID",
      });
    }

    if (!status || !["Pending", "Approved", "Rejected", "Exchanged"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (Pending, Approved, Rejected, Exchanged)",
      });
    }

    const exchange = await ExchangeRequest.findByPk(exchangeId);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found",
      });
    }

    // Update exchange request
    await exchange.update({
      status,
      replacementProduct: replacementProduct || exchange.replacementProduct,
      trackingNumber: trackingNumber || exchange.trackingNumber,
    });

    return res.status(200).json({
      success: true,
      message: "Exchange request status updated successfully",
      exchange: serializeModel(exchange),
    });
  } catch (error: any) {
    logError("UPDATE EXCHANGE STATUS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update exchange request status",
    });
  }
};

export const getAllExchangeRequests = async (req: any, res: Response) => {
  try {
    const { status, userId } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (userId) whereClause.user = Number(userId);

    const exchanges = await ExchangeRequest.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: exchanges.length,
      exchanges: exchanges.map((exchange) => serializeModel(exchange)),
    });
  } catch (error: any) {
    logError("GET ALL EXCHANGE REQUESTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch exchange requests",
    });
  }
};
