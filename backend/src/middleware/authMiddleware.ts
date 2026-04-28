import { Request } from "express";
import authMiddlewareDefault from "./auth";

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = authMiddlewareDefault;

export default authMiddlewareDefault;
