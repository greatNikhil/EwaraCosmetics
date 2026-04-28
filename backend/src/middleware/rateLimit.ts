import { NextFunction, Request, Response } from "express";

type Bucket = {
  count: number;
  expiresAt: number;
};

const buckets = new Map<string, Bucket>();

const getClientKey = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || "unknown";
};

export const createRateLimiter = ({
  windowMs,
  maxRequests,
  message,
}: {
  windowMs: number;
  maxRequests: number;
  message: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const routeKey = `${req.method}:${req.baseUrl}${req.path}`;
    const clientKey = `${routeKey}:${getClientKey(req)}`;
    const now = Date.now();
    const existingBucket = buckets.get(clientKey);

    if (!existingBucket || existingBucket.expiresAt <= now) {
      buckets.set(clientKey, {
        count: 1,
        expiresAt: now + windowMs,
      });
      return next();
    }

    if (existingBucket.count >= maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existingBucket.expiresAt - now) / 1000)
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    existingBucket.count += 1;
    buckets.set(clientKey, existingBucket);
    next();
  };
};
