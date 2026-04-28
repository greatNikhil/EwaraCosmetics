import assert from "node:assert/strict";
import Coupon from "../models/coupon";
import { getCouponSource, resolveCouponDiscount } from "../utils/coupon";

const originalFindOne = (Coupon as any).findOne;

export const runCouponTests = async () => {
  (Coupon as any).findOne = async () => null;

  const coupon = await getCouponSource("EWARA10");

  assert.deepEqual(coupon, {
    code: "EWARA10",
    type: "percent",
    value: 10,
    minOrderAmount: 0,
  });

  const percentageResult = await resolveCouponDiscount({
    code: "EWARA10",
    subtotal: 1000,
  });

  assert.equal(percentageResult.discountAmount, 100);
  assert.equal(percentageResult.coupon?.code, "EWARA10");

  (Coupon as any).findOne = async () => ({
    code: "VIP200",
    type: "flat",
    value: 200,
    minOrderAmount: 1500,
    expiresAt: undefined,
  });

  await assert.rejects(
    () =>
      resolveCouponDiscount({
        code: "VIP200",
        subtotal: 1000,
      }),
    /Minimum order amount is Rs\. 1500/
  );

  (Coupon as any).findOne = async ({ code }: { code: string }) => ({
    code,
    type: "flat",
    value: 100,
    minOrderAmount: 0,
    maxUses: 2,
    usedCount: 2,
    expiresAt: undefined,
  });

  await assert.rejects(
    () =>
      resolveCouponDiscount({
        code: "save100",
        subtotal: 1000,
      }),
    /Coupon limit reached/
  );

  (Coupon as any).findOne = async ({ code }: { code: string }) => ({
    code,
    type: "flat",
    value: 100,
    minOrderAmount: 0,
    expiresAt: new Date(Date.now() - 60_000),
  });

  await assert.rejects(
    () =>
      resolveCouponDiscount({
        code: "SAVE100",
        subtotal: 1000,
      }),
    /Coupon has expired/
  );

  (Coupon as any).findOne = originalFindOne;
};
