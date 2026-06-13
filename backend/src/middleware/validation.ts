import { NextFunction, Request, Response } from "express";

const badRequest = (res: Response, message: string) =>
  res.status(400).json({
    success: false,
    message,
  });

const containsHtmlTag = (value: string) => /<[^>]+>/.test(value);

export const validateObjectIdParam = (paramName = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];

    if (!value || Number.isNaN(Number(value))) {
      return badRequest(res, `Invalid ${paramName}`);
    }

    next();
  };
};

export const validateCouponRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code, subtotal } = req.body;

  if (!code || !String(code).trim()) {
    return badRequest(res, "Coupon code is required");
  }

  if (subtotal !== undefined) {
    const parsedSubtotal = Number(subtotal);

    if (Number.isNaN(parsedSubtotal) || parsedSubtotal < 0) {
      return badRequest(res, "Invalid subtotal");
    }
  }

  next();
};

export const validateProfileRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, phone } = req.body;

  if (!name || !String(name).trim()) {
    return badRequest(res, "Name is required");
  }

  if (!email || !String(email).trim()) {
    return badRequest(res, "Email is required");
  }

  if (!phone || !String(phone).trim()) {
    return badRequest(res, "Phone is required");
  }

  next();
};

export const validateAddressCreateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requiredFields = ["name", "address", "phone", "pincode", "city", "state"];

  for (const field of requiredFields) {
    if (!req.body[field] || !String(req.body[field]).trim()) {
      return badRequest(res, `Please provide ${field}`);
    }
  }

  next();
};

export const validateAddressUpdateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const fieldsToCheck = ["name", "address", "phone", "pincode", "city", "state"];

  for (const field of fieldsToCheck) {
    if (req.body[field] !== undefined && !String(req.body[field]).trim()) {
      return badRequest(res, `${field} cannot be empty`);
    }
  }

  next();
};

export const validateReviewRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { rating, comment } = req.body;
  const parsedRating = Number(rating);

  if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
    return badRequest(res, "Rating must be between 1 and 5");
  }

  if (!comment || !String(comment).trim()) {
    return badRequest(res, "Review comment is required");
  }

  next();
};

export const validateAdminCouponRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code, type, value, minOrderAmount, maxUses, expiresAt } = req.body;

  if (code !== undefined && !String(code).trim()) {
    return badRequest(res, "Coupon code is required");
  }

  if (type !== undefined && !["percent", "flat"].includes(String(type))) {
    return badRequest(res, "Coupon type must be percent or flat");
  }

  if (value !== undefined) {
    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      return badRequest(res, "Coupon value must be a valid positive number");
    }
  }

  if (minOrderAmount !== undefined) {
    const parsedMinAmount = Number(minOrderAmount);

    if (Number.isNaN(parsedMinAmount) || parsedMinAmount < 0) {
      return badRequest(
        res,
        "Minimum order amount must be a valid positive number"
      );
    }
  }

  if (maxUses !== undefined && maxUses !== null && maxUses !== "") {
    const parsedMaxUses = Number(maxUses);

    if (Number.isNaN(parsedMaxUses) || parsedMaxUses < 1) {
      return badRequest(res, "Max uses must be a valid positive number");
    }
  }

  if (expiresAt !== undefined && expiresAt !== null && expiresAt !== "") {
    const parsedExpiry = new Date(String(expiresAt));

    if (Number.isNaN(parsedExpiry.getTime())) {
      return badRequest(res, "Coupon expiry date is invalid");
    }
  }

  next();
};

export const validateAdminUserRoleRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role } = req.body;

  if (!role || !["user", "admin"].includes(String(role))) {
    return badRequest(res, "Role must be either user or admin");
  }

  next();
};

export const validateAdminOfferRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { text, displayOrder } = req.body;

  if (text !== undefined) {
    const value = String(text).trim();

    if (!value) {
      return badRequest(res, "Offer text is required");
    }

    if (containsHtmlTag(value)) {
      return badRequest(res, "Offer text cannot contain HTML");
    }
  }

  if (displayOrder !== undefined) {
    const parsedOrder = Number(displayOrder);

    if (Number.isNaN(parsedOrder) || parsedOrder < 0) {
      return badRequest(res, "Display order must be a valid positive number");
    }
  }

  next();
};

export const validateProductRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const textFields = [
    { key: "name", label: "Product name" },
    { key: "slug", label: "Product slug" },
    { key: "description", label: "Product description" },
    { key: "shortDescription", label: "Product short description" },
    { key: "brand", label: "Product brand" },
    { key: "category", label: "Product category" },
  ] as const;

  for (const field of textFields) {
    const rawValue = req.body[field.key];

    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    const value = String(rawValue).trim();

    if (!value) {
      return badRequest(res, `${field.label} cannot be empty`);
    }

    if (containsHtmlTag(value)) {
      return badRequest(res, `${field.label} cannot contain HTML`);
    }
  }

  next();
};
