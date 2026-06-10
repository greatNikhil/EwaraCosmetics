import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/user";
import Otp from "../models/otp";
import sendEmail from "../utils/sendEmail";
import sendSms from "../utils/sendSms";
import {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail,
} from "../utils/emailService";

const getAccountAccessError = (user: any) => {
  if (user?.isDeleted) {
    return "This account is no longer available";
  }

  if (user?.isBlocked) {
    return "Your account has been blocked. Please contact support.";
  }

  return null;
};

const normalizeEmail = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizePhone = (value: unknown) =>
  String(value || "")
    .trim()
    .replace(/[^\d]/g, "")
    .slice(-10);

const isEmailLike = (value: string) => value.includes("@");

const resolveIdentifier = (value: unknown) => {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return null;
  }

  if (isEmailLike(trimmed)) {
    return {
      type: "email" as const,
      value: normalizeEmail(trimmed),
    };
  }

  const phone = normalizePhone(trimmed);

  if (phone.length >= 10) {
    return {
      type: "phone" as const,
      value: phone,
    };
  }

  return null;
};

const getOtpLookupValue = (identifier: { type: "email" | "phone"; value: string }) =>
  identifier.type === "email" ? identifier.value : identifier.value;

const findUserByIdentifier = async (identifier: { type: "email" | "phone"; value: string }) => {
  if (identifier.type === "email") {
    return User.findOne({ where: { email: identifier.value } });
  }

  return User.findOne({ where: { phone: identifier.value } });
};

const sendOtpMessage = async (
  identifier: { type: "email" | "phone"; value: string },
  otp: string,
  purpose: "registration" | "password-reset"
) => {
  if (identifier.type === "email") {
    const subject =
      purpose === "registration"
        ? "Your Ewara OTP Code"
        : "Your Ewara Password Reset OTP";

    const html =
      purpose === "registration"
        ? `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your OTP is: ${otp}</h2>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
        : `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your password reset OTP is: ${otp}</h2>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `;

    await sendEmail(identifier.value, subject, html);
    return;
  }

  const smsPrefix =
    purpose === "registration"
      ? "Ewara signup OTP"
      : "Ewara password reset OTP";

  await sendSms({
    to: identifier.value.startsWith("+") ? identifier.value : `+91${identifier.value}`,
    body: `${smsPrefix}: ${otp}. Valid for 5 minutes.`,
  });
};

const buildAuthSuccessResponse = (user: any) => {
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      _id: user.id,
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.role,
    },
  };
};

// SEND OTP
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email, phone, identifier } = req.body;
    const resolvedIdentifier = resolveIdentifier(identifier || email || phone);

    if (!resolvedIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    const existingUser = await findUserByIdentifier(resolvedIdentifier);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          resolvedIdentifier.type === "email"
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = getOtpLookupValue(resolvedIdentifier);

    await Otp.destroy({ where: { email: otpKey } });

    await Otp.create({
      email: otpKey,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpMessage(resolvedIdentifier, otp, "registration");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      channel: resolvedIdentifier.type,
    });
  } catch (error: any) {
    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, otp, otpChannel } = req.body;

    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedPhone = normalizePhone(phone);

    if (!trimmedPhone || trimmedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number is required",
      });
    }

    const existingUserByEmail = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const existingUserByPhone = await User.findOne({ where: { phone: trimmedPhone } });
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    const verificationKey =
      String(otpChannel || "email").toLowerCase() === "phone"
        ? trimmedPhone
        : normalizedEmail;

    const otpData = await Otp.findOne({ where: { email: verificationKey } });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (otpData.expiresAt < new Date()) {
      await Otp.destroy({ where: { email: verificationKey } });

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP",
      });
    }

    if (otpData.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      phone: trimmedPhone,
      password: hashedPassword,
      role: "user",
    });

    await Otp.destroy({ where: { email: verificationKey } });

    // Send welcome email
    await sendWelcomeEmail(normalizedEmail, trimmedName);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, phone, identifier, password } = req.body;
    const resolvedIdentifier = resolveIdentifier(identifier || email || phone);

    if (!resolvedIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or phone and password are required",
      });
    }

    const user = await findUserByIdentifier(resolvedIdentifier);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accountAccessError = getAccountAccessError(user);
    if (accountAccessError) {
      return res.status(403).json({
        success: false,
        message: accountAccessError,
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    return res.status(200).json(buildAuthSuccessResponse(user));
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
};

// GET LOGGED-IN USER
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const accountAccessError = getAccountAccessError(user);
    if (accountAccessError) {
      return res.status(403).json({
        success: false,
        message: accountAccessError,
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user.toJSON(),
        _id: user.id,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error: any) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(
        token
      )}`
    );
    const tokenInfo = await tokenInfoRes.json();

    if (!tokenInfoRes.ok || !tokenInfo?.email || !tokenInfo?.sub) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google token",
      });
    }

    const normalizedEmail = String(tokenInfo.email).trim().toLowerCase();
    const normalizedName = String(tokenInfo.name || "").trim() || "Google User";

    let user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      user = await User.create({
        name: normalizedName,
        email: normalizedEmail,
        googleId: String(tokenInfo.sub).trim(),
        avatar: String(tokenInfo.picture || "").trim(),
        password: null,
        role: "user",
      });

      await sendWelcomeEmail(normalizedEmail, normalizedName);
    } else {
      const accountAccessError = getAccountAccessError(user);
      if (accountAccessError) {
        return res.status(403).json({
          success: false,
          message: accountAccessError,
        });
      }
    }

    if (user && !user.googleId) {
      user.googleId = String(tokenInfo.sub).trim();
      user.avatar = String(tokenInfo.picture || user.avatar || "").trim();
      await user.save();
    }

    return res.status(200).json(buildAuthSuccessResponse(user));
  } catch (error: any) {
    console.error("GOOGLE LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, lastname, email, phone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required",
      });
    }

    const trimmedName = String(name).trim();
    const trimmedLastname = String(lastname || "").trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedPhone = String(phone).trim();

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingUserByEmail = await User.findOne({
      where: {
        email: normalizedEmail,
        id: { [Op.ne]: userId },
      },
    });

    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const existingUserByPhone = await User.findOne({
      where: {
        phone: trimmedPhone,
        id: { [Op.ne]: userId },
      },
    });

    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    user.name = trimmedName;
    user.lastname = trimmedLastname;
    user.email = normalizedEmail;
    user.phone = trimmedPhone;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
};

// FORGOT PASSWORD - SEND OTP
export const forgotPasswordSendOTP = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phone, identifier } = req.body;
    const resolvedIdentifier = resolveIdentifier(identifier || email || phone);

    if (!resolvedIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    const user = await findUserByIdentifier(resolvedIdentifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = getOtpLookupValue(resolvedIdentifier);

    await Otp.destroy({ where: { email: otpKey } });

    await Otp.create({
      email: otpKey,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Create reset link (user will need OTP to verify)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/forgot-password`;

    if (resolvedIdentifier.type === "email") {
      // Send password reset email with template
      await sendPasswordResetEmail(resolvedIdentifier.value, {
        customerName: user.name || "User",
        resetLink: `${resetLink}?email=${resolvedIdentifier.value}`,
        expiryTime: "5 minutes",
      });
    } else {
      await sendSms({
        to: `+91${resolvedIdentifier.value}`,
        body: `Ewara password reset OTP: ${otp}. Use this code on ${resetLink}. Valid for 5 minutes.`,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        resolvedIdentifier.type === "email"
          ? "Password reset OTP sent to your email"
          : "Password reset OTP sent to your phone",
      channel: resolvedIdentifier.type,
    });
  } catch (error: any) {
    console.error("FORGOT PASSWORD SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, phone, identifier, otp, newPassword } = req.body;
    const resolvedIdentifier = resolveIdentifier(identifier || email || phone);

    if (!resolvedIdentifier || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email or phone, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await findUserByIdentifier(resolvedIdentifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otpKey = getOtpLookupValue(resolvedIdentifier);
    const otpData = await Otp.findOne({ where: { email: otpKey } });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (otpData.expiresAt < new Date()) {
      await Otp.destroy({ where: { email: otpKey } });

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP",
      });
    }

    if (otpData.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await Otp.destroy({ where: { email: otpKey } });

    await sendPasswordResetSuccessEmail(user.email, {
      customerName: user.name || "User",
      loginLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
};
