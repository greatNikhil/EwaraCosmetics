import assert from "node:assert/strict";
import crypto from "crypto";
import Order from "../models/order.model";
import Product from "../models/Product";
import User from "../models/user";
import {
  createOrder,
  getOrderById,
  notifyPaymentFailure,
  updatePaymentStatus,
  updateOrderStatus,
} from "../controllers/order.controller";
import * as couponUtils from "../utils/coupon";
import * as emailService from "../utils/emailService";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalProductFindByPk = (Product as any).findByPk;
const originalOrderFindByPk = (Order as any).findByPk;
const originalOrderCreate = (Order as any).create;
const originalResolveCouponDiscount = (couponUtils as any).resolveCouponDiscount;
const originalIncrementCouponUsage = (couponUtils as any).incrementCouponUsage;
const originalUserFindByPk = (User as any).findByPk;
const originalSendPaymentFailedEmail = (emailService as any).sendPaymentFailedEmail;
const originalSendOrderShippedEmail = (emailService as any).sendOrderShippedEmail;
const originalSendOrderDeliveredEmail =
  (emailService as any).sendOrderDeliveredEmail;
const originalSendOrderConfirmationEmail =
  (emailService as any).sendOrderConfirmationEmail;
const originalSendPaymentSuccessEmail =
  (emailService as any).sendPaymentSuccessEmail;

export const runOrderControllerTests = async () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalRazorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  try {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.RAZORPAY_KEY_SECRET = "test_secret";

    (couponUtils as any).resolveCouponDiscount = async () => ({
      coupon: null,
      discountAmount: 0,
    });
    (couponUtils as any).incrementCouponUsage = async () => undefined;
    let orderConfirmationEmailPayload: any = null;
    let paymentSuccessEmailPayload: any = null;
    (emailService as any).sendOrderConfirmationEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      orderConfirmationEmailPayload = { customerEmail, payload };
    };
    (emailService as any).sendPaymentSuccessEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      paymentSuccessEmailPayload = { customerEmail, payload };
    };

    let stockSaveCalled = false;
    (Product as any).findByPk = async () => ({
      id: 11,
      name: "Glow Serum",
      price: 100,
      countInStock: 10,
      isPublished: true,
      images: ["/serum.jpg"],
      save: async () => {
        stockSaveCalled = true;
      },
    });

    const mismatchReq = createMockRequest({
      body: {
        items: [
          {
            productId: 11,
            quantity: 2,
            image: "/serum.jpg",
          },
        ],
        totalAmount: 100,
        paymentMethod: "COD",
      },
      user: { id: 99 } as any,
    });
    const mismatchRes = createMockResponse();

    await createOrder(mismatchReq as any, mismatchRes as any);

    assert.equal(mismatchRes.statusCode, 400);
    assert.deepEqual(mismatchRes.body, {
      success: false,
      message: "Order total mismatch. Please refresh and try again.",
      totals: {
        subtotalAmount: 200,
        discountAmount: 0,
        gstAmount: 36,
        shippingAmount: 0,
        totalAmount: 236,
      },
    });
    assert.equal(stockSaveCalled, false);

    (Product as any).findByPk = async () => ({
      id: 19,
      name: "Glow Serum",
      price: 100,
      countInStock: 3,
      isPublished: true,
      images: ["/serum.jpg"],
      save: async () => undefined,
    });

    const oversellReq = createMockRequest({
      body: {
        items: [
          {
            productId: 19,
            quantity: 5,
          },
        ],
        totalAmount: 590,
        paymentMethod: "COD",
      },
      user: { id: 99 } as any,
    });
    const oversellRes = createMockResponse();

    await createOrder(oversellReq as any, oversellRes as any);

    assert.equal(oversellRes.statusCode, 400);
    assert.deepEqual(oversellRes.body, {
      success: false,
      message: "Insufficient stock for Glow Serum. Only 3 left.",
    });

    let couponUsageCode: string | null = null;
    (couponUtils as any).resolveCouponDiscount = async () => ({
      coupon: { code: "SAVE100" },
      discountAmount: 50,
    });
    (couponUtils as any).incrementCouponUsage = async (code: string) => {
      couponUsageCode = code;
    };

    const productRecord = {
      id: 20,
      name: "Glow Serum",
      price: 1000,
      countInStock: 5,
      isPublished: true,
      images: ["/serum.jpg"],
      save: async function () {
        return this;
      },
    };
    (Product as any).findByPk = async () => productRecord;

    const createdOrders: any[] = [];
    (Order as any).create = async (payload: any) => {
      const order = {
        id: 120 + createdOrders.length,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        ...payload,
        get() {
          const { get: _get, ...plain } = this;
          return {
            ...plain,
          };
        },
      };
      createdOrders.push(order);
      return order;
    };

    (User as any).findByPk = async () => ({
      id: 99,
      email: "buyer@example.com",
      name: "Buyer",
    });

    const codSuccessReq = createMockRequest({
      body: {
        items: [
          {
            productId: 20,
            quantity: 1,
          },
        ],
        totalAmount: 1171,
        paymentMethod: "Cash on Delivery",
        couponCode: "SAVE100",
      },
      user: { id: 99 } as any,
    });
    const codSuccessRes = createMockResponse();

    await createOrder(codSuccessReq as any, codSuccessRes as any);

    assert.equal(codSuccessRes.statusCode, 201);
    assert.equal(createdOrders[0].shippingAmount, 50);
    assert.equal(createdOrders[0].gstAmount, 171);
    assert.equal(createdOrders[0].totalAmount, 1171);
    assert.equal(createdOrders[0].paymentStatus, "Pending");
    assert.equal(createdOrders[0].status, "Pending");
    assert.equal(couponUsageCode, "SAVE100");
    assert.deepEqual(orderConfirmationEmailPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        id: 120,
        _id: 120,
        createdAt: createdOrders[0].createdAt,
        user: 99,
        items: createdOrders[0].items,
        subtotalAmount: 1000,
        couponCode: "SAVE100",
        discountAmount: 50,
        gstAmount: 171,
        shippingAmount: 50,
        totalAmount: 1171,
        paymentMethod: "Cash on Delivery",
        shippingAddress: undefined,
        status: "Pending",
        paymentStatus: "Pending",
        razorpayPaymentId: undefined,
        razorpayOrderId: undefined,
        customerName: "Buyer",
      },
    });

    (couponUtils as any).resolveCouponDiscount = async () => ({
      coupon: null,
      discountAmount: 50,
    });

    let incompleteSignatureStockSaveCalled = false;
    (Product as any).findByPk = async () => ({
      id: 20,
      name: "Glow Serum",
      price: 1000,
      countInStock: 5,
      isPublished: true,
      images: ["/serum.jpg"],
      save: async () => {
        incompleteSignatureStockSaveCalled = true;
      },
    });

    const incompleteRazorpayReq = createMockRequest({
      body: {
        items: [
          {
            productId: 20,
            quantity: 1,
          },
        ],
        totalAmount: 1121,
        paymentMethod: "Razorpay",
        razorpayPaymentId: "pay_missing_signature",
      },
      user: { id: 99 } as any,
    });
    const incompleteRazorpayRes = createMockResponse();

    await createOrder(incompleteRazorpayReq as any, incompleteRazorpayRes as any);

    assert.equal(incompleteRazorpayRes.statusCode, 400);
    assert.deepEqual(incompleteRazorpayRes.body, {
      success: false,
      message: "Razorpay payment verification details are required",
    });
    assert.equal(incompleteSignatureStockSaveCalled, false);
    assert.equal(createdOrders.length, 1);

    const razorpaySuccessReq = createMockRequest({
      body: {
        items: [
          {
            productId: 20,
            quantity: 1,
          },
        ],
        totalAmount: 1121,
        paymentMethod: "Razorpay",
        razorpayPaymentId: "pay_test_123",
        razorpayOrderId: "order_test_123",
        razorpaySignature: crypto
          .createHmac("sha256", "test_secret")
          .update("order_test_123|pay_test_123")
          .digest("hex"),
      },
      user: { id: 99 } as any,
    });
    const razorpaySuccessRes = createMockResponse();

    await createOrder(razorpaySuccessReq as any, razorpaySuccessRes as any);

    assert.equal(razorpaySuccessRes.statusCode, 201);
    assert.equal(createdOrders[1].shippingAmount, 0);
    assert.equal(createdOrders[1].gstAmount, 171);
    assert.equal(createdOrders[1].totalAmount, 1121);
    assert.equal(createdOrders[1].paymentStatus, "Completed");
    assert.equal(createdOrders[1].status, "Processing");
    assert.deepEqual(paymentSuccessEmailPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        orderId: "121",
        amount: 1121,
        paymentMethod: "Razorpay",
        transactionId: "pay_test_123",
        customerEmail: "buyer@example.com",
        items: [
          {
            productId: 20,
            name: "Glow Serum",
            price: 1000,
            quantity: 1,
            image: "/serum.jpg",
          },
        ],
        shippingAddress: undefined,
        subtotalAmount: 1000,
        discountAmount: 50,
        gstAmount: 171,
        shippingAmount: 0,
        createdAt: createdOrders[1].createdAt,
      },
    });

    let signatureStockSaveCalled = false;
    (Product as any).findByPk = async () => ({
      id: 21,
      name: "Night Repair Cream",
      price: 850,
      countInStock: 7,
      isPublished: true,
      images: ["/cream.jpg"],
      save: async () => {
        signatureStockSaveCalled = true;
      },
    });

    const invalidSignatureReq = createMockRequest({
      body: {
        items: [
          {
            productId: 21,
            quantity: 1,
          },
        ],
        totalAmount: 1003,
        paymentMethod: "Razorpay",
        razorpayOrderId: "order_test_invalid",
        razorpayPaymentId: "pay_test_invalid",
        razorpaySignature: "bad_signature",
      },
      user: { id: 99 } as any,
    });
    const invalidSignatureRes = createMockResponse();

    await createOrder(invalidSignatureReq as any, invalidSignatureRes as any);

    assert.equal(invalidSignatureRes.statusCode, 400);
    assert.deepEqual(invalidSignatureRes.body, {
      success: false,
      message: "Razorpay payment signature verification failed",
    });
    assert.equal(signatureStockSaveCalled, false);
    assert.equal(createdOrders.length, 2);

    let paymentFailureEmailPayload: any = null;
    (User as any).findByPk = async () => ({
      id: 99,
      name: "Buyer",
      email: "buyer@example.com",
    });
    (emailService as any).sendPaymentFailedEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      paymentFailureEmailPayload = { customerEmail, payload };
    };

    const notifyFailureReq = createMockRequest({
      body: {
        amount: 1121,
        reason: "User cancelled checkout",
        razorpayOrderId: "order_retry_123",
      },
      user: { id: 99 } as any,
    });
    const notifyFailureRes = createMockResponse();

    await notifyPaymentFailure(notifyFailureReq as any, notifyFailureRes as any);

    assert.equal(notifyFailureRes.statusCode, 200);
    assert.deepEqual(notifyFailureRes.body, {
      success: true,
      message: "Payment failure email sent",
    });
    assert.deepEqual(paymentFailureEmailPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        orderId: "order_retry_123",
        amount: 1121,
        reason: "User cancelled checkout",
        retryLink: "http://localhost:3000/cart",
      },
    });

    (Order as any).findByPk = async () => ({
      id: 12,
      user: 13,
      get() {
        return this;
      },
    });

    const deniedReq = createMockRequest({
      params: { id: "12" } as any,
      user: { id: 14, role: "user" } as any,
    });
    const deniedRes = createMockResponse();

    await getOrderById(deniedReq as any, deniedRes as any);

    assert.equal(deniedRes.statusCode, 403);
    assert.deepEqual(deniedRes.body, {
      success: false,
      message: "Access denied",
    });

    (User as any).findByPk = async () => ({
      id: 13,
      name: "Buyer",
      email: "buyer@example.com",
      get() {
        const { get: _get, ...plain } = this;
        return plain;
      },
    });

    const adminReq = createMockRequest({
      params: { id: "12" } as any,
      user: { id: 15, role: "admin" } as any,
    });
    const adminRes = createMockResponse();

    await getOrderById(adminReq as any, adminRes as any);

    assert.equal(adminRes.statusCode, 200);
    assert.equal((adminRes.body as any).success, true);

    let failureEmailPayload: any = null;
    (emailService as any).sendPaymentFailedEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      failureEmailPayload = {
        customerEmail,
        payload,
      };
    };

    const orderRecord = {
      id: 16,
      user: 99,
      paymentStatus: "Pending",
      totalAmount: 799,
      save: async function () {
        return this;
      },
      get() {
        return this;
      },
    };

    (Order as any).findByPk = async () => orderRecord;
    (User as any).findByPk = async () => ({
      id: 99,
      email: "buyer@example.com",
      name: "Buyer",
    });

    const paymentReq = createMockRequest({
      params: { id: "16" } as any,
      body: { paymentStatus: "Failed", reason: "Bank declined" },
    });
    const paymentRes = createMockResponse();

    await updatePaymentStatus(paymentReq as any, paymentRes as any);

    assert.equal(paymentRes.statusCode, 200);
    assert.equal(orderRecord.paymentStatus, "Failed");
    assert.deepEqual(failureEmailPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        orderId: "16",
        amount: 799,
        reason: "Bank declined",
        retryLink: "http://localhost:3000/orders/16",
      },
    });

    let restoredStock = 0;
    let shippedEmailPayload: any = null;
    let deliveredEmailPayload: any = null;
    (Product as any).findByPk = async () => ({
      id: 18,
      countInStock: 4,
      save: async function () {
        restoredStock = this.countInStock;
        return this;
      },
    });
    (emailService as any).sendOrderShippedEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      shippedEmailPayload = { customerEmail, payload };
    };
    (emailService as any).sendOrderDeliveredEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      deliveredEmailPayload = { customerEmail, payload };
    };

    const cancellableOrder = {
      id: 17,
      user: 99,
      status: "Processing",
      stockRestored: false,
      razorpayOrderId: "order_test_123",
      items: [
        {
          productId: 18,
          quantity: 2,
        },
      ],
      save: async function () {
        return this;
      },
      get() {
        return this;
      },
    };

    (Order as any).findByPk = async () => cancellableOrder;
    (User as any).findByPk = async () => ({
      id: 99,
      email: "buyer@example.com",
      name: "Buyer",
    });

    const cancelReq = createMockRequest({
      params: { id: "17" } as any,
      body: { status: "Cancelled" },
    });
    const cancelRes = createMockResponse();

    await updateOrderStatus(cancelReq as any, cancelRes as any);

    assert.equal(cancelRes.statusCode, 200);
    assert.equal(cancellableOrder.status, "Cancelled");
    assert.equal(cancellableOrder.stockRestored, true);
    assert.equal(restoredStock, 6);

    const shippedReq = createMockRequest({
      params: { id: "17" } as any,
      body: { status: "Shipped" },
    });
    const shippedRes = createMockResponse();

    await updateOrderStatus(shippedReq as any, shippedRes as any);

    assert.equal(shippedRes.statusCode, 200);
    assert.deepEqual(shippedEmailPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        orderId: "17",
        trackingNumber: "order_test_123",
        trackingUrl: "http://localhost:3000/orders/17",
        estimatedDelivery: shippedEmailPayload?.payload?.estimatedDelivery,
        carrier: "Ewara Delivery",
      },
    });

    const deliveredReq = createMockRequest({
      params: { id: "17" } as any,
      body: { status: "Delivered" },
    });
    const deliveredRes = createMockResponse();

    await updateOrderStatus(deliveredReq as any, deliveredRes as any);

    assert.equal(deliveredRes.statusCode, 200);
    assert.deepEqual(deliveredEmailPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        orderId: "17",
        deliveryDate: deliveredEmailPayload?.payload?.deliveryDate,
        feedbackLink: "http://localhost:3000/services",
      },
    });
  } finally {
    (Product as any).findByPk = originalProductFindByPk;
    (Order as any).findByPk = originalOrderFindByPk;
    (Order as any).create = originalOrderCreate;
    (couponUtils as any).resolveCouponDiscount = originalResolveCouponDiscount;
    (couponUtils as any).incrementCouponUsage = originalIncrementCouponUsage;
    (User as any).findByPk = originalUserFindByPk;
    (emailService as any).sendPaymentFailedEmail =
      originalSendPaymentFailedEmail;
    (emailService as any).sendOrderShippedEmail =
      originalSendOrderShippedEmail;
    (emailService as any).sendOrderDeliveredEmail =
      originalSendOrderDeliveredEmail;
    (emailService as any).sendOrderConfirmationEmail =
      originalSendOrderConfirmationEmail;
    (emailService as any).sendPaymentSuccessEmail =
      originalSendPaymentSuccessEmail;
    if (typeof originalAppUrl === "undefined") {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
    if (typeof originalRazorpaySecret === "undefined") {
      delete process.env.RAZORPAY_KEY_SECRET;
    } else {
      process.env.RAZORPAY_KEY_SECRET = originalRazorpaySecret;
    }
  }
};
