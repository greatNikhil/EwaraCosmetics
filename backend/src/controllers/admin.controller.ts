import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import Order from "../models/order.model";
import Product from "../models/Product";
import User from "../models/user";

const serializeModel = <T extends { get: (options?: unknown) => any }>(model: T) => {
  const plain = model.get({ plain: true });
  return { ...plain, _id: plain.id };
};

export const getDashboardSummary = async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      recentOrders,
      recentUsers,
      statusBreakdown,
    ] = await Promise.all([
      User.count({ where: { isDeleted: false } }),
      Product.count(),
      Order.count(),
      Order.sum("totalAmount", {
        where: {
          paymentStatus: {
            [Op.in]: ["Completed", "Refunded"],
          },
        },
      }),
      Product.findAll({
        where: { countInStock: { [Op.lte]: 5 } },
        order: [
          ["countInStock", "ASC"],
          ["updatedAt", "DESC"],
        ],
        limit: 5,
        attributes: ["id", "name", "slug", "countInStock", "price", "images", "isPublished"],
      }),
      Order.findAll({
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      User.findAll({
        where: { isDeleted: false },
        order: [["createdAt", "DESC"]],
        limit: 5,
        attributes: ["id", "name", "email", "phone", "role", "createdAt"],
      }),
      Order.findAll({
        attributes: ["status", [fn("COUNT", col("status")), "count"]],
        group: ["status"],
        raw: true,
      }),
    ]);

    const recentOrderUserIds = Array.from(
      new Set(recentOrders.map((order) => order.user).filter((id) => Boolean(id)))
    );
    const orderUsers = recentOrderUserIds.length
      ? await User.findAll({
          where: { id: recentOrderUserIds },
          attributes: ["id", "name", "email"],
        })
      : [];
    const userMap = new Map(orderUsers.map((user) => [user.id, user]));

    const ordersByStatus = statusBreakdown.reduce<Record<string, number>>(
      (acc, item: any) => {
        acc[item.status] = Number(item.count);
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
        totalRevenue: Number(totalRevenue || 0),
        recentOrders: recentOrders.map((order) => ({
          ...serializeModel(order),
          user:
            order.user && userMap.get(order.user)
              ? serializeModel(userMap.get(order.user)!)
              : order.user,
        })),
        recentUsers: recentUsers.map((user) => serializeModel(user)),
        lowStockProducts: lowStockProducts.map((product) => serializeModel(product)),
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

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((user) => serializeModel(user)),
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
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!userId || Number.isNaN(userId)) {
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

    if (Number(req.user?.id) === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user || user.isDeleted) {
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
      user: serializeModel(user),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user role",
    });
  }
};

export const toggleUserBlocked = async (req: any, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (Number(req.user?.id) === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own account",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user: serializeModel(user),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
};

export const softDeleteUser = async (req: any, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (Number(req.user?.id) === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isDeleted = true;
    user.isBlocked = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};
