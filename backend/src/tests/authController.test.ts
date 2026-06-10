import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/otp";
import User from "../models/user";
import {
  forgotPasswordSendOTP,
  googleLogin,
  login,
  register,
  resetPassword,
  sendOTP,
  updateProfile,
} from "../controllers/auth.controller";
import * as sendEmailModule from "../utils/sendEmail";
import * as emailService from "../utils/emailService";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalOtpCreate = (Otp as any).create;
const originalOtpDestroy = (Otp as any).destroy;
const originalOtpFindOne = (Otp as any).findOne;
const originalUserCreate = (User as any).create;
const originalUserFindOne = (User as any).findOne;
const originalUserFindByPk = (User as any).findByPk;
const originalBcryptCompare = (bcrypt as any).compare;
const originalBcryptHash = (bcrypt as any).hash;
const originalJwtSign = (jwt as any).sign;
const originalSendEmail = (sendEmailModule as any).default;
const originalSendPasswordResetEmail =
  (emailService as any).sendPasswordResetEmail;
const originalSendPasswordResetSuccessEmail =
  (emailService as any).sendPasswordResetSuccessEmail;
const originalSendWelcomeEmail = (emailService as any).sendWelcomeEmail;
const originalFetch = global.fetch;

export const runAuthControllerTests = async () => {
  try {
    const missingReq = createMockRequest({
      body: { email: "", password: "" },
    });
    const missingRes = createMockResponse();

    await login(missingReq as any, missingRes as any);

    assert.equal(missingRes.statusCode, 400);
    assert.deepEqual(missingRes.body, {
      success: false,
      message: "Email or phone and password are required",
    });

    (User as any).findOne = async () => null;

    const invalidReq = createMockRequest({
      body: { email: "buyer@example.com", password: "wrong-pass" },
    });
    const invalidRes = createMockResponse();

    await login(invalidReq as any, invalidRes as any);

    assert.equal(invalidRes.statusCode, 400);
    assert.deepEqual(invalidRes.body, {
      success: false,
      message: "Invalid credentials",
    });

    (User as any).findOne = async (query: any) => {
      if (query?.where?.email === "buyer@example.com") {
        return {
          id: 101,
          name: "Buyer",
          lastname: "",
          email: "buyer@example.com",
          phone: "9876543210",
          password: "hashed-password",
          role: "user",
        };
      }

      return null;
    };
    (bcrypt as any).compare = async () => true;
    (jwt as any).sign = () => "signed-jwt-token";

    const successReq = createMockRequest({
      body: { email: "buyer@example.com", password: "secret123" },
    });
    const successRes = createMockResponse();

    await login(successReq as any, successRes as any);

    assert.equal(successRes.statusCode, 200);
    assert.deepEqual(successRes.body, {
      success: true,
      message: "Login successful",
      token: "signed-jwt-token",
      user: {
        _id: 101,
        id: 101,
        name: "Buyer",
        lastname: "",
        email: "buyer@example.com",
        phone: "9876543210",
        avatar_url: undefined,
        role: "user",
      },
    });

    (User as any).findOne = async (query: any) => {
      if (query?.where?.phone === "9876543210") {
        return {
          id: 101,
          name: "Buyer",
          lastname: "",
          email: "buyer@example.com",
          phone: "9876543210",
          password: "hashed-password",
          role: "user",
        };
      }

      return null;
    };

    const phoneLoginReq = createMockRequest({
      body: { identifier: "9876543210", password: "secret123" },
    });
    const phoneLoginRes = createMockResponse();

    await login(phoneLoginReq as any, phoneLoginRes as any);

    assert.equal(phoneLoginRes.statusCode, 200);

    let otpEmailPayload: any = null;
    (User as any).findOne = async () => null;
    (Otp as any).destroy = async () => undefined;
    (Otp as any).create = async (payload: any) => payload;
    (sendEmailModule as any).default = async (
      to: string,
      subject: string,
      html: string
    ) => {
      otpEmailPayload = { to, subject, html };
      return undefined;
    };

    const otpReq = createMockRequest({
      body: { email: "NewUser@Example.com" },
    });
    const otpRes = createMockResponse();

    await sendOTP(otpReq as any, otpRes as any);

    assert.equal(otpRes.statusCode, 200);
    assert.equal((otpRes.body as any).success, true);
    assert.equal(otpEmailPayload.to, "newuser@example.com");
    assert.equal(otpEmailPayload.subject, "Your Ewara OTP Code");
    assert.match(otpEmailPayload.html, /Your OTP is:/);

    let welcomeEmailPayload: any = null;
    (User as any).findOne = async (query: any) => {
      if (
        query?.where?.email === "fresh@example.com" ||
        query?.where?.phone === "9999999999"
      ) {
        return null;
      }

      return null;
    };
    (Otp as any).findOne = async () => ({
      otp: "123456",
      expiresAt: new Date(Date.now() + 60_000),
    });
    (bcrypt as any).hash = async () => "newly-hashed-password";
    (User as any).create = async (payload: any) => ({
      id: 102,
      role: "user",
      ...payload,
    });
    (emailService as any).sendWelcomeEmail = async (
      customerEmail: string,
      customerName: string
    ) => {
      welcomeEmailPayload = { customerEmail, customerName };
    };

    const registerReq = createMockRequest({
      body: {
        name: "Fresh User",
        email: "fresh@example.com",
        phone: "9999999999",
        password: "secret123",
        otp: "123456",
      },
    });
    const registerRes = createMockResponse();

    await register(registerReq as any, registerRes as any);

    assert.equal(registerRes.statusCode, 201);
    assert.deepEqual(welcomeEmailPayload, {
      customerEmail: "fresh@example.com",
      customerName: "Fresh User",
    });

    let passwordResetPayload: any = null;
    (User as any).findOne = async (query: any) => {
      if (query?.where?.email === "buyer@example.com") {
        return {
          id: 103,
          name: "Buyer",
          email: "buyer@example.com",
        };
      }

      return null;
    };
    (Otp as any).create = async (payload: any) => payload;
    (emailService as any).sendPasswordResetEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      passwordResetPayload = { customerEmail, payload };
    };

    const forgotReq = createMockRequest({
      body: { email: "buyer@example.com" },
    });
    const forgotRes = createMockResponse();

    await forgotPasswordSendOTP(forgotReq as any, forgotRes as any);

    assert.equal(forgotRes.statusCode, 200);
    assert.deepEqual(passwordResetPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        resetLink: "http://localhost:3000/forgot-password?email=buyer@example.com",
        expiryTime: "5 minutes",
      },
    });

    let passwordResetSuccessPayload: any = null;
    const resetUser = {
      name: "Buyer",
      password: "old-password",
      save: async function () {
        return this;
      },
    };
    (User as any).findOne = async () => resetUser;
    (Otp as any).findOne = async () => ({
      otp: "654321",
      expiresAt: new Date(Date.now() + 60_000),
    });
    (bcrypt as any).hash = async () => "reset-password-hash";
    (emailService as any).sendPasswordResetSuccessEmail = async (
      customerEmail: string,
      payload: any
    ) => {
      passwordResetSuccessPayload = { customerEmail, payload };
    };

    const resetReq = createMockRequest({
      body: {
        email: "buyer@example.com",
        otp: "654321",
        newPassword: "new-secret123",
      },
    });
    const resetRes = createMockResponse();

    await resetPassword(resetReq as any, resetRes as any);

    assert.equal(resetRes.statusCode, 200);
    assert.equal(resetUser.password, "reset-password-hash");
    assert.deepEqual(passwordResetSuccessPayload, {
      customerEmail: "buyer@example.com",
      payload: {
        customerName: "Buyer",
        loginLink: "http://localhost:3000/login",
      },
    });

    let googleWelcomeEmailPayload: any = null;
    (User as any).findOne = async () => null;
    (User as any).create = async (payload: any) => ({
      id: 104,
      role: "user",
      phone: undefined,
      ...payload,
    });
    (emailService as any).sendWelcomeEmail = async (
      customerEmail: string,
      customerName: string
    ) => {
      googleWelcomeEmailPayload = { customerEmail, customerName };
    };
    global.fetch = (async () =>
      ({
        ok: true,
        json: async () => ({
          email: "google@example.com",
          name: "Google Buyer",
          sub: "google-sub-123",
          picture: "https://example.com/avatar.jpg",
        }),
      }) as Response) as typeof fetch;

    const googleReq = createMockRequest({
      body: { token: "google-access-token" },
    });
    const googleRes = createMockResponse();

    await googleLogin(googleReq as any, googleRes as any);

    assert.equal(googleRes.statusCode, 200);
    assert.deepEqual(googleWelcomeEmailPayload, {
      customerEmail: "google@example.com",
      customerName: "Google Buyer",
    });

    const profileMissingReq = createMockRequest({
      body: { name: "Buyer" },
      user: {} as any,
    });
    const profileMissingRes = createMockResponse();

    await updateProfile(profileMissingReq as any, profileMissingRes as any);

    assert.equal(profileMissingRes.statusCode, 401);
    assert.deepEqual(profileMissingRes.body, {
      success: false,
      message: "Unauthorized",
    });

    const userRecord = {
      id: 105,
      name: "Old",
      lastname: "",
      email: "old@example.com",
      phone: "9999999999",
      role: "user",
      save: async function () {
        return this;
      },
    };

    let findOneCall = 0;
    (User as any).findByPk = async () => userRecord;
    (User as any).findOne = async () => {
      findOneCall += 1;
      return findOneCall === 1 ? { id: 106 } : null;
    };

    const duplicateEmailReq = createMockRequest({
      body: {
        name: "Buyer",
        lastname: "Test",
        email: "taken@example.com",
        phone: "8888888888",
      },
      user: { id: 105 } as any,
    });
    const duplicateEmailRes = createMockResponse();

    await updateProfile(duplicateEmailReq as any, duplicateEmailRes as any);

    assert.equal(duplicateEmailRes.statusCode, 400);
    assert.deepEqual(duplicateEmailRes.body, {
      success: false,
      message: "Email already in use",
    });

    findOneCall = 0;
    (User as any).findOne = async () => null;

    const updateReq = createMockRequest({
      body: {
        name: "Buyer",
        lastname: "Updated",
        email: "buyer.updated@example.com",
        phone: "8888888888",
      },
      user: { id: 105 } as any,
    });
    const updateRes = createMockResponse();

    await updateProfile(updateReq as any, updateRes as any);

    assert.equal(updateRes.statusCode, 200);
    assert.equal(userRecord.name, "Buyer");
    assert.equal(userRecord.lastname, "Updated");
    assert.equal(userRecord.email, "buyer.updated@example.com");
    assert.equal(userRecord.phone, "8888888888");
  } finally {
    (Otp as any).create = originalOtpCreate;
    (Otp as any).destroy = originalOtpDestroy;
    (Otp as any).findOne = originalOtpFindOne;
    (User as any).create = originalUserCreate;
    (User as any).findOne = originalUserFindOne;
    (User as any).findByPk = originalUserFindByPk;
    (bcrypt as any).compare = originalBcryptCompare;
    (bcrypt as any).hash = originalBcryptHash;
    (jwt as any).sign = originalJwtSign;
    (sendEmailModule as any).default = originalSendEmail;
    (emailService as any).sendPasswordResetEmail =
      originalSendPasswordResetEmail;
    (emailService as any).sendPasswordResetSuccessEmail =
      originalSendPasswordResetSuccessEmail;
    (emailService as any).sendWelcomeEmail = originalSendWelcomeEmail;
    global.fetch = originalFetch;
  }
};
