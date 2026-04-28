import assert from "node:assert/strict";
import User from "../models/user";
import {
  getPromoTemplates,
  sendPromoToAllUsers,
  sendPromoToUser,
} from "../controllers/promo.controller";
import * as emailService from "../utils/emailService";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalUserFind = (User as any).find;
const originalUserFindById = (User as any).findById;
const originalSendPromotionalEmail =
  (emailService as any).sendPromotionalEmail;

export const runPromoControllerTests = async () => {
  try {
    const unauthorizedReq = createMockRequest({
      user: { role: "user" } as any,
      body: {
        userId: "507f1f77bcf86cd799439031",
        title: "Summer Offer",
        content: "Special offer",
        ctaText: "Shop Now",
        ctaLink: "http://localhost:3000/shop",
      },
    });
    const unauthorizedRes = createMockResponse();

    await sendPromoToUser(unauthorizedReq as any, unauthorizedRes as any);

    assert.equal(unauthorizedRes.statusCode, 403);
    assert.deepEqual(unauthorizedRes.body, {
      success: false,
      message: "Only admins can send promotional emails",
    });

    let singlePromoPayload: any = null;
    (User as any).findById = async () => ({
      _id: "507f1f77bcf86cd799439031",
      name: "Promo Buyer",
      email: "promo@example.com",
    });
    (emailService as any).sendPromotionalEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      singlePromoPayload = { customerEmail, payload };
    };

    const promoReq = createMockRequest({
      user: { role: "admin" } as any,
      body: {
        userId: "507f1f77bcf86cd799439031",
        title: "Summer Offer",
        content: "Special offer",
        ctaText: "Shop Now",
        ctaLink: "http://localhost:3000/shop",
        discount: "20%",
      },
    });
    const promoRes = createMockResponse();

    await sendPromoToUser(promoReq as any, promoRes as any);

    assert.equal(promoRes.statusCode, 200);
    assert.deepEqual(singlePromoPayload, {
      customerEmail: "promo@example.com",
      payload: {
        customerName: "Promo Buyer",
        title: "Summer Offer",
        content: "Special offer",
        ctaText: "Shop Now",
        ctaLink: "http://localhost:3000/shop",
        imageUrl: undefined,
        discount: "20%",
        expiryDate: undefined,
      },
    });

    let bulkRecipients: string[] = [];
    (User as any).find = async () => [
      { name: "User One", email: "one@example.com" },
      { name: "User Two", email: "two@example.com" },
    ];
    (emailService as any).sendPromotionalEmail = async (
      customerEmail: string
    ) => {
      bulkRecipients.push(customerEmail);
    };

    const bulkReq = createMockRequest({
      user: { role: "admin" } as any,
      body: {
        title: "Flash Sale",
        content: "Only for today",
        ctaText: "Grab Deals",
        ctaLink: "http://localhost:3000/shop",
      },
    });
    const bulkRes = createMockResponse();

    await sendPromoToAllUsers(bulkReq as any, bulkRes as any);
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(bulkRes.statusCode, 200);
    assert.deepEqual((bulkRecipients || []).sort(), [
      "one@example.com",
      "two@example.com",
    ]);

    const templatesReq = createMockRequest();
    const templatesRes = createMockResponse();

    await getPromoTemplates(templatesReq as any, templatesRes as any);

    assert.equal(templatesRes.statusCode, 200);
    assert.equal((templatesRes.body as any).success, true);
    assert.equal(Array.isArray((templatesRes.body as any).templates), true);
    assert.equal((templatesRes.body as any).templates.length > 0, true);
  } finally {
    (User as any).find = originalUserFind;
    (User as any).findById = originalUserFindById;
    (emailService as any).sendPromotionalEmail = originalSendPromotionalEmail;
  }
};
