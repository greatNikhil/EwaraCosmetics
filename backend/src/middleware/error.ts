import { NextFunction, Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error("UNHANDLED ERROR:", error);

  return res.status(error?.statusCode || 500).json({
    success: false,
    message: error?.message || "Internal server error",
  });
};
