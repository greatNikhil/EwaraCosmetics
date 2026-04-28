import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/order.model";
import Product from "../models/Product";
import User from "../models/user";

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenueResult,
      lowStockProducts,
      recentOrders,
      recentUsers,
      statusBreakdown,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            paymentStatus: { $in: ["Completed", "Refunded"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
      Product.find({ countInStock: { $lte: 5 } })
        .sort({ countInStock: 1, updatedAt: -1 })
        .limit(5)
        .select("name slug countInStock price images isPublished"),
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email phone role createdAt"),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const revenue = totalRevenueResult[0]?.totalRevenue || 0;

    const ordersByStatus = statusBreakdown.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    );

    return res.status(200).json({
      success: true,
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenue,
        recentOrders,
        recentUsers,
        lowStockProducts,
        ordersByStatus: {
          Pending: ordersByStatus.Pending || 0,
          Processing: ordersByStatus.Processing || 0,
          Shipped: ordersByStatus.Shipped || 0,
          Delivered: ordersByStatus.Delivered || 0,
          Cancelled: ordersByStatus.Cancelled || 0,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard summary",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

export const updateUserRole = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (req.user?.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user role",
    });
  }
};
