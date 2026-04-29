import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

interface AuthRequest extends Request {
  user?: any;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided or invalid token format",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    const user = await User.findByPk(Number(decoded?.id), {
      attributes: ["id", "googleId", "password", "isBlocked", "isDeleted"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token invalid or expired",
      });
    }

    if (user.isDeleted || user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: user.isDeleted
          ? "This account is no longer available"
          : "Your account has been blocked. Please contact support.",
      });
    }

    if (user.googleId && user.password == null) {
      req.user = decoded;
      return next();
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};

export default authMiddleware;
