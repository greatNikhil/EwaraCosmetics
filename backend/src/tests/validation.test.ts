import assert from "node:assert/strict";
import {
  validateAdminCouponRequest,
  validateCouponRequest,
  validateProductRequest,
  validateReviewRequest,
} from "../middleware/validation";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

export const runValidationTests = async () => {
  let nextCalled = false;
  const validCouponReq = createMockRequest({
    body: { code: "EWARA10", subtotal: 1000 },
  });
  const validCouponRes = createMockResponse();

  validateCouponRequest(validCouponReq, validCouponRes as any, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(validCouponRes.statusCode, 200);

  const invalidReviewReq = createMockRequest({
    body: { rating: 5, comment: "" },
  });
  const invalidReviewRes = createMockResponse();

  validateReviewRequest(invalidReviewReq, invalidReviewRes as any, () => undefined);

  assert.equal(invalidReviewRes.statusCode, 400);
  assert.deepEqual(invalidReviewRes.body, {
    success: false,
    message: "Review comment is required",
  });

  const invalidAdminCouponReq = createMockRequest({
    body: { code: "SAVE", type: "weird", value: 10 },
  });
  const invalidAdminCouponRes = createMockResponse();

  validateAdminCouponRequest(
    invalidAdminCouponReq,
    invalidAdminCouponRes as any,
    () => undefined
  );

  assert.equal(invalidAdminCouponRes.statusCode, 400);
  assert.deepEqual(invalidAdminCouponRes.body, {
    success: false,
    message: "Coupon type must be percent or flat",
  });

  const invalidProductReq = createMockRequest({
    body: {
      name: '<img src=x onerror=alert("xss")>',
      slug: "glow-serum",
    },
  });
  const invalidProductRes = createMockResponse();

  validateProductRequest(invalidProductReq, invalidProductRes as any, () => undefined);

  assert.equal(invalidProductRes.statusCode, 400);
  assert.deepEqual(invalidProductRes.body, {
    success: false,
    message: "Product name cannot contain HTML",
  });
};
