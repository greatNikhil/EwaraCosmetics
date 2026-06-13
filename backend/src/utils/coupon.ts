import Coupon from "../models/coupon";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const normalizeCouponExpiresAt = (
  expiresAt?: string | Date | null
): Date | null => {
  if (!expiresAt) return null;

  if (expiresAt instanceof Date) {
    if (
      expiresAt.getUTCHours() === 0 &&
      expiresAt.getUTCMinutes() === 0 &&
      expiresAt.getUTCSeconds() === 0 &&
      expiresAt.getUTCMilliseconds() === 0
    ) {
      return normalizeCouponExpiresAt(expiresAt.toISOString().slice(0, 10));
    }

    return expiresAt;
  }

  const value = String(expiresAt).trim();
  if (!value) return null;

  if (DATE_ONLY_PATTERN.test(value)) {
    // Admin date input sends YYYY-MM-DD. Treat that as valid through the
    // full selected business day in India instead of expiring at midnight.
    return new Date(`${value}T23:59:59.999+05:30`);
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid coupon expiry date");
  }

  return parsedDate;
};

export const isCouponExpired = (
  expiresAt?: Date | string | null,
  now = new Date()
) => {
  const normalizedExpiry = normalizeCouponExpiresAt(expiresAt);
  return Boolean(normalizedExpiry && normalizedExpiry.getTime() < now.getTime());
};

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

  if (isCouponExpired(coupon.expiresAt)) {
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
