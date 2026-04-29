import Coupon from "../models/coupon";

export type CouponSource = {
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrderAmount: number;
  maxUses?: number | null;
  usedCount?: number;
  expiresAt?: Date | null;
};

export const getCouponSource = async (
  code: string
): Promise<CouponSource | null> => {
  const coupon = await Coupon.findOne({ where: { code, isActive: true } });

  if (coupon) {
    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount || 0,
      expiresAt: coupon.expiresAt,
    };
  }

  return null;
};

export const resolveCouponDiscount = async ({
  code,
  subtotal,
}: {
  code?: string | null;
  subtotal: number;
}) => {
  if (!code) {
    return {
      coupon: null,
      discountAmount: 0,
    };
  }

  const normalizedCode = String(code).trim().toUpperCase();
  const coupon = await getCouponSource(normalizedCode);

  if (!coupon) {
    throw new Error("Invalid coupon");
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new Error("Coupon has expired");
  }

  if (
    coupon.maxUses !== undefined &&
    coupon.maxUses !== null &&
    (coupon.usedCount || 0) >= coupon.maxUses
  ) {
    throw new Error("Coupon limit reached");
  }

  if (subtotal < (coupon.minOrderAmount || 0)) {
    throw new Error(`Minimum order amount is Rs. ${coupon.minOrderAmount}`);
  }

  const discountAmount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;

  return {
    coupon,
    discountAmount: Math.min(discountAmount, subtotal),
  };
};

export const incrementCouponUsage = async (
  code?: string | null,
  transaction?: any
) => {
  if (!code) return;

  const normalizedCode = String(code).trim().toUpperCase();
  const coupon = await Coupon.findOne({
    where: { code: normalizedCode, isActive: true },
    transaction,
  });

  if (coupon) {
    coupon.usedCount = Number(coupon.usedCount || 0) + 1;
    await coupon.save({ transaction });
  }
};
