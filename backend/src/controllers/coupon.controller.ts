import { Request, Response } from "express";
import { Op } from "sequelize";
import Coupon from "../models/coupon";
import { resolveCouponDiscount } from "../utils/coupon";

const serializeCoupon = (coupon: Coupon) => {
  const plain = coupon.get({ plain: true });
  return { ...plain, _id: plain.id };
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const orderSubtotal = Number(subtotal || 0);

    if (Number.isNaN(orderSubtotal) || orderSubtotal < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });
    }

    const { coupon, discountAmount } = await resolveCouponDiscount({
      code: normalizedCode,
      subtotal: orderSubtotal,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount: Math.min(discountAmount, orderSubtotal),
      },
    });
  } catch (error: any) {
    console.error("VALIDATE COUPON ERROR:", error);

    const message = error.message || "Failed to validate coupon";
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

export const getCoupons = async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons: coupons.map((coupon) => serializeCoupon(coupon)),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupons",
    });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, type, value, minOrderAmount, isActive, expiresAt, maxUses } =
      req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, type and value are required",
      });
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const existingCoupon = await Coupon.findOne({
      where: { code: normalizedCode },
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount || 0),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      maxUses:
        maxUses !== undefined && maxUses !== null ? Number(maxUses) : undefined,
      usedCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon: serializeCoupon(coupon),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create coupon",
    });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const couponId = Number(req.params.id);
    const { code, type, value, minOrderAmount, isActive, expiresAt, maxUses } =
      req.body;

    const existingCoupon = await Coupon.findByPk(couponId);

    if (!existingCoupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (code !== undefined) {
      const normalizedCode = String(code).trim().toUpperCase();
      const duplicateCoupon = await Coupon.findOne({
        where: {
          code: normalizedCode,
          id: { [Op.ne]: couponId },
        },
      });

      if (duplicateCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      existingCoupon.code = normalizedCode;
    }

    if (type !== undefined) {
      existingCoupon.type = type;
    }

    if (value !== undefined) {
      existingCoupon.value = Number(value);
    }

    if (minOrderAmount !== undefined) {
      existingCoupon.minOrderAmount = Number(minOrderAmount);
    }

    if (isActive !== undefined) {
      existingCoupon.isActive = Boolean(isActive);
    }

    if (maxUses !== undefined) {
      existingCoupon.maxUses =
        maxUses === null || maxUses === "" ? null : Number(maxUses);
    }

    if (expiresAt !== undefined) {
      existingCoupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    await existingCoupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: serializeCoupon(existingCoupon),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update coupon",
    });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const couponId = Number(req.params.id);
    const coupon = await Coupon.findByPk(couponId);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await coupon.destroy();

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete coupon",
    });
  }
};
