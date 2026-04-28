import assert from "node:assert/strict";
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

const originalProductFindById = (Product as any).findById;
const originalOrderFindById = (Order as any).findById;
const originalOrderCreate = (Order as any).create;
const originalResolveCouponDiscount = (couponUtils as any).resolveCouponDiscount;
const originalIncrementCouponUsage = (couponUtils as any).incrementCouponUsage;
const originalUserFindById = (User as any).findById;
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
    (Product as any).findById = async () => ({
      _id: "507f1f77bcf86cd799439011",
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
            productId: "507f1f77bcf86cd799439011",
            quantity: 2,
            image: "/serum.jpg",
          },
        ],
        totalAmount: 100,
        paymentMethod: "COD",
      },
      user: { id: "507f1f77bcf86cd799439099" } as any,
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

    (Product as any).findById = async () => ({
      _id: "507f1f77bcf86cd799439019",
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
            productId: "507f1f77bcf86cd799439019",
            quantity: 5,
          },
        ],
        totalAmount: 590,
        paymentMethod: "COD",
      },
      user: { id: "507f1f77bcf86cd799439099" } as any,
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
      _id: "507f1f77bcf86cd799439020",
      name: "Glow Serum",
      price: 1000,
      countInStock: 5,
      isPublished: true,
      images: ["/serum.jpg"],
      save: async function () {
        return this;
      },
    };
    (Product as any).findById = async () => productRecord;

    const createdOrders: any[] = [];
    (Order as any).create = async (payload: any) => {
      const order = {
        _id: "507f1f77bcf86cd799439120",
        ...payload,
        toObject() {
          return {
            _id: this._id,
            ...payload,
          };
        },
      };
      createdOrders.push(order);
      return order;
    };

    (User as any).findById = async () => ({
      email: "buyer@example.com",
      name: "Buyer",
    });

    const codSuccessReq = createMockRequest({
      body: {
        items: [
          {
            productId: "507f1f77bcf86cd799439020",
            quantity: 1,
          },
        ],
        totalAmount: 1171,
        paymentMethod: "Cash on Delivery",
        couponCode: "SAVE100",
      },
      user: { id: "507f1f77bcf86cd799439099" } as any,
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
        _id: "507f1f77bcf86cd799439120",
        user: "507f1f77bcf86cd799439099",
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

    const razorpaySuccessReq = createMockRequest({
      body: {
        items: [
          {
            productId: "507f1f77bcf86cd799439020",
            quantity: 1,
          },
        ],
        totalAmount: 1121,
        paymentMethod: "Razorpay",
        razorpayPaymentId: "pay_test_123",
      },
      user: { id: "507f1f77bcf86cd799439099" } as any,
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
        orderId: "507f1f77bcf86cd799439120",
        amount: 1121,
        paymentMethod: "Razorpay",
        transactionId: "pay_test_123",
      },
    });

    let signatureStockSaveCalled = false;
    (Product as any).findById = async () => ({
      _id: "507f1f77bcf86cd799439021",
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
            productId: "507f1f77bcf86cd799439021",
            quantity: 1,
          },
        ],
        totalAmount: 1003,
        paymentMethod: "Razorpay",
        razorpayOrderId: "order_test_invalid",
        razorpayPaymentId: "pay_test_invalid",
        razorpaySignature: "bad_signature",
      },
      user: { id: "507f1f77bcf86cd799439099" } as any,
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
    (User as any).findById = () => ({
      select: async () => ({
        name: "Buyer",
        email: "buyer@example.com",
      }),
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
      user: { id: "507f1f77bcf86cd799439099" } as any,
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

    (Order as any).findById = () => ({
      populate: async () => ({
        _id: "507f1f77bcf86cd799439012",
        user: {
          _id: {
            toString: () => "507f1f77bcf86cd799439013",
          },
        },
      }),
    });

    const deniedReq = createMockRequest({
      params: { id: "507f1f77bcf86cd799439012" } as any,
      user: { id: "507f1f77bcf86cd799439014", role: "user" } as any,
    });
    const deniedRes = createMockResponse();

    await getOrderById(deniedReq as any, deniedRes as any);

    assert.equal(deniedRes.statusCode, 403);
    assert.deepEqual(deniedRes.body, {
      success: false,
      message: "Access denied",
    });

    const adminReq = createMockRequest({
      params: { id: "507f1f77bcf86cd799439012" } as any,
      user: { id: "507f1f77bcf86cd799439015", role: "admin" } as any,
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
      _id: {
        toString: () => "507f1f77bcf86cd799439016",
      },
      paymentStatus: "Pending",
      totalAmount: 799,
      user: {
        email: "buyer@example.com",
        name: "Buyer",
      },
      save: async function () {
        return this;
      },
    };

    (Order as any).findById = () => ({
      populate: async () => orderRecord,
    });

    const paymentReq = createMockRequest({
      params: { id: "507f1f77bcf86cd799439016" } as any,
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
        orderId: "507f1f77bcf86cd799439016",
        amount: 799,
        reason: "Bank declined",
        retryLink: "http://localhost:3000/orders/507f1f77bcf86cd799439016",
      },
    });

    let restoredStock = 0;
    let shippedEmailPayload: any = null;
    let deliveredEmailPayload: any = null;
    (Product as any).findById = async () => ({
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
      _id: {
        toString: () => "507f1f77bcf86cd799439017",
      },
      status: "Processing",
      stockRestored: false,
      razorpayOrderId: "order_test_123",
      items: [
        {
          productId: "507f1f77bcf86cd799439018",
          quantity: 2,
        },
      ],
      save: async function () {
        return this;
      },
      populate: async function () {
        return {
          ...this,
          user: {
            email: "buyer@example.com",
            name: "Buyer",
          },
        };
      },
    };

    (Order as any).findById = async () => cancellableOrder;

    const cancelReq = createMockRequest({
      params: { id: "507f1f77bcf86cd799439017" } as any,
      body: { status: "Cancelled" },
    });
    const cancelRes = createMockResponse();

    await updateOrderStatus(cancelReq as any, cancelRes as any);

    assert.equal(cancelRes.statusCode, 200);
    assert.equal(cancellableOrder.status, "Cancelled");
    assert.equal(cancellableOrder.stockRestored, true);
    assert.equal(restoredStock, 6);

    const shippedReq = createMockRequest({
      params: { id: "507f1f77bcf86cd799439017" } as any,
      body: { status: "Shipped" },
    });
    const shippedRes = createMockResponse();

    await updateOrderStatus(shippedReq as any, shippedRes as any);

    assert.equal(shippedRes.statusCode, 200);
    assert.deepEqual(shippedEmailPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        orderId: "507f1f77bcf86cd799439017",
        trackingNumber: "order_test_123",
        trackingUrl: "http://localhost:3000/orders/507f1f77bcf86cd799439017",
        estimatedDelivery: shippedEmailPayload?.payload?.estimatedDelivery,
        carrier: "Ewara Delivery",
      },
    });

    const deliveredReq = createMockRequest({
      params: { id: "507f1f77bcf86cd799439017" } as any,
      body: { status: "Delivered" },
    });
    const deliveredRes = createMockResponse();

    await updateOrderStatus(deliveredReq as any, deliveredRes as any);

    assert.equal(deliveredRes.statusCode, 200);
    assert.deepEqual(deliveredEmailPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        orderId: "507f1f77bcf86cd799439017",
        deliveryDate: deliveredEmailPayload?.payload?.deliveryDate,
        feedbackLink: "http://localhost:3000/services",
      },
    });
  } finally {
    (Product as any).findById = originalProductFindById;
    (Order as any).findById = originalOrderFindById;
    (Order as any).create = originalOrderCreate;
    (couponUtils as any).resolveCouponDiscount = originalResolveCouponDiscount;
    (couponUtils as any).incrementCouponUsage = originalIncrementCouponUsage;
    (User as any).findById = originalUserFindById;
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
