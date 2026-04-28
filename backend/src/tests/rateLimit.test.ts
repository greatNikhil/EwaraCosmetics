import assert from "node:assert/strict";
import { createRateLimiter } from "../middleware/rateLimit";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

export const runRateLimitTests = async () => {
  const allowLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 2,
    message: "Too many requests",
  });

  let nextCalls = 0;
  const allowedReq = createMockRequest({
    method: "POST",
    baseUrl: "/api/auth",
    path: "/login",
    ip: "1.2.3.4",
  });

  const res1 = createMockResponse();
  const res2 = createMockResponse();

  allowLimiter(allowedReq, res1 as any, () => {
    nextCalls += 1;
  });
  allowLimiter(allowedReq, res2 as any, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
  assert.equal(res1.statusCode, 200);
  assert.equal(res2.statusCode, 200);

  const blockLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 1,
    message: "Too many requests",
  });

  const blockedReq = createMockRequest({
    method: "POST",
    baseUrl: "/api/auth",
    path: "/login",
    ip: "5.6.7.8",
  });

  blockLimiter(blockedReq, createMockResponse() as any, () => undefined);
  const blockedResponse = createMockResponse();
  blockLimiter(blockedReq, blockedResponse as any, () => undefined);

  assert.equal(blockedResponse.statusCode, 429);
  assert.equal(blockedResponse.headers["Retry-After"], "60");
  assert.deepEqual(blockedResponse.body, {
    success: false,
    message: "Too many requests",
  });
};
