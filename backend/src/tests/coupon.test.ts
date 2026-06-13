import assert from "node:assert/strict";
import Coupon from "../models/coupon";
import {
  getCouponSource,
  isCouponExpired,
  normalizeCouponExpiresAt,
  resolveCouponDiscount,
} from "../utils/coupon";

const originalFindOne = (Coupon as any).findOne;

export const runCouponTests = async () => {
  (Coupon as any).findOne = async () => null;

  const coupon = await getCouponSource("EWARA10");

  assert.equal(coupon, null);

  await assert.rejects(
    () =>
      resolveCouponDiscount({
        code: "EWARA10",
        subtotal: 1000,
      }),
    /Invalid coupon/
  );

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

  const normalizedExpiry = normalizeCouponExpiresAt("2026-06-13");
  assert.equal(normalizedExpiry?.toISOString(), "2026-06-13T18:29:59.999Z");
  assert.equal(
    isCouponExpired("2026-06-13", new Date("2026-06-13T18:29:59.000Z")),
    false
  );
  assert.equal(
    isCouponExpired("2026-06-13", new Date("2026-06-13T18:30:00.000Z")),
    true
  );
  assert.equal(
    normalizeCouponExpiresAt(new Date("2026-06-13T00:00:00.000Z"))?.toISOString(),
    "2026-06-13T18:29:59.999Z"
  );

  (Coupon as any).findOne = originalFindOne;
};
