import assert from "node:assert/strict";
import Coupon from "../models/coupon";
import {
  createCoupon,
  deleteCoupon,
  updateCoupon,
  validateCoupon,
} from "../controllers/coupon.controller";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";
import * as couponUtils from "../utils/coupon";

const originalFindOne = (Coupon as any).findOne;
const originalCreate = (Coupon as any).create;
const originalFindByPk = (Coupon as any).findByPk;
const originalResolveCouponDiscount = (couponUtils as any).resolveCouponDiscount;

export const runCouponControllerTests = async () => {
  (Coupon as any).findOne = async () => ({ _id: "dup" });

  const duplicateReq = createMockRequest({
    body: { code: "SAVE10", type: "percent", value: 10 },
  });
  const duplicateRes = createMockResponse();

  await createCoupon(duplicateReq as any, duplicateRes as any);

  assert.equal(duplicateRes.statusCode, 400);
  assert.deepEqual(duplicateRes.body, {
    success: false,
    message: "Coupon code already exists",
  });

  const savedCoupon = {
    id: 1,
    code: "SAVE10",
    type: "percent",
    value: 10,
    minOrderAmount: 100,
    maxUses: 2,
    isActive: true,
    expiresAt: undefined,
    save: async function () {
      return this;
    },
    get: function () {
      return this;
    },
  };

  (Coupon as any).findByPk = async () => savedCoupon;
  (Coupon as any).findOne = async () => null;

  const updateReq = createMockRequest({
    params: { id: "1" } as any,
    body: {
      code: "SAVE20",
      value: 20,
      minOrderAmount: 200,
      maxUses: 5,
      isActive: false,
    },
  });
  const updateRes = createMockResponse();

  await updateCoupon(updateReq as any, updateRes as any);

  assert.equal(updateRes.statusCode, 200);
  assert.equal(savedCoupon.code, "SAVE20");
  assert.equal(savedCoupon.value, 20);
  assert.equal(savedCoupon.minOrderAmount, 200);
  assert.equal(savedCoupon.maxUses, 5);
  assert.equal(savedCoupon.isActive, false);

  (couponUtils as any).resolveCouponDiscount = async () => {
    throw new Error("Coupon limit reached");
  };

  const validateReq = createMockRequest({
    body: { code: "save100", subtotal: 600 },
  });
  const validateRes = createMockResponse();

  await validateCoupon(validateReq as any, validateRes as any);

  assert.equal(validateRes.statusCode, 400);
  assert.deepEqual(validateRes.body, {
    success: false,
    message: "Coupon limit reached",
  });

  (Coupon as any).findByPk = async () => null;

  const deleteMissingReq = createMockRequest({
    params: { id: "2" } as any,
  });
  const deleteMissingRes = createMockResponse();

  await deleteCoupon(deleteMissingReq as any, deleteMissingRes as any);

  assert.equal(deleteMissingRes.statusCode, 404);
  assert.deepEqual(deleteMissingRes.body, {
    success: false,
    message: "Coupon not found",
  });

  (Coupon as any).findByPk = async () => ({
    id: 2,
    destroy: async () => undefined,
  });

  const deleteReq = createMockRequest({
    params: { id: "2" } as any,
  });
  const deleteRes = createMockResponse();

  await deleteCoupon(deleteReq as any, deleteRes as any);

  assert.equal(deleteRes.statusCode, 200);
  assert.deepEqual(deleteRes.body, {
    success: true,
    message: "Coupon deleted successfully",
  });

  (Coupon as any).findOne = originalFindOne;
  (Coupon as any).create = originalCreate;
  (Coupon as any).findByPk = originalFindByPk;
  (couponUtils as any).resolveCouponDiscount = originalResolveCouponDiscount;
};
