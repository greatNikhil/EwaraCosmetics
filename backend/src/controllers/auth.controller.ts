import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Otp from "../models/otp";
import sendEmail from "../utils/sendEmail";
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
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

// SEND OTP
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.destroy({ where: { email: normalizedEmail } });

    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail(
      normalizedEmail,
      "Your Ewara OTP Code",
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your OTP is: ${otp}</h2>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
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
    const { name, email, phone, password, otp } = req.body;

    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

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

    const otpData = await Otp.findOne({ where: { email: normalizedEmail } });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (otpData.expiresAt < new Date()) {
      await Otp.destroy({ where: { email: normalizedEmail } });

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

    await Otp.destroy({ where: { email: normalizedEmail } });

    // Send welcome email
    await sendWelcomeEmail(normalizedEmail, trimmedName);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });

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
        id: { [require("sequelize").Op.ne]: userId },
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
        id: { [require("sequelize").Op.ne]: userId },
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.destroy({ where: { email: normalizedEmail } });

    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Create reset link (user will need OTP to verify)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/forgot-password?email=${normalizedEmail}`;

    // Send password reset email with template
    await sendPasswordResetEmail(normalizedEmail, {
      customerName: user.name || "User",
      resetLink,
      expiryTime: "5 minutes",
    });

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
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
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otpData = await Otp.findOne({ where: { email: normalizedEmail } });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (otpData.expiresAt < new Date()) {
      await Otp.destroy({ where: { email: normalizedEmail } });

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

    await Otp.destroy({ where: { email: normalizedEmail } });

    await sendPasswordResetSuccessEmail(normalizedEmail, {
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
