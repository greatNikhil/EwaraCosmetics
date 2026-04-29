import { Request, Response } from "express";
import { Op } from "sequelize";
import User from "../models/user";
import { sendPromotionalEmail } from "../utils/emailService";

export const sendPromoToUser = async (req: any, res: Response) => {
  try {
    const { userId, title, content, ctaText, ctaLink, imageUrl, discount, expiryDate } =
      req.body;

    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can send promotional emails",
      });
    }

    if (!userId || !title || !content || !ctaText || !ctaLink) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, title, content, ctaText, ctaLink",
      });
    }

    const user = await User.findByPk(Number(userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await sendPromotionalEmail(user.email, {
      customerName: user.name || "Valued Customer",
      title,
      content,
      ctaText,
      ctaLink,
      imageUrl,
      discount,
      expiryDate,
    });

    return res.status(200).json({
      success: true,
      message: `Promotional email sent to ${user.email}`,
    });
  } catch (error: any) {
    console.error("SEND PROMO EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send promotional email",
      error: error.message,
    });
  }
};

export const sendPromoToAllUsers = async (req: any, res: Response) => {
  try {
    const {
      title,
      content,
      ctaText,
      ctaLink,
      imageUrl,
      discount,
      expiryDate,
      excludeEmails,
    } = req.body;

    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can send promotional emails",
      });
    }

    if (!title || !content || !ctaText || !ctaLink) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, content, ctaText, ctaLink",
      });
    }

    const where: Record<string, unknown> = {};
    if (excludeEmails && Array.isArray(excludeEmails) && excludeEmails.length > 0) {
      where.email = { [Op.notIn]: excludeEmails };
    }

    const users = await User.findAll({ where });

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No users found to send email to",
      });
    }

    users.forEach((user) => {
      sendPromotionalEmail(user.email, {
        customerName: user.name || "Valued Customer",
        title,
        content,
        ctaText,
        ctaLink,
        imageUrl,
        discount,
        expiryDate,
      }).catch((error) => {
        console.error(`Failed to send to ${user.email}:`, error);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Promotional email campaign started",
      totalUsers: users.length,
      note: "Emails are being sent in the background",
    });
  } catch (error: any) {
    console.error("SEND PROMO EMAIL TO ALL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start promotional email campaign",
      error: error.message,
    });
  }
};

export const getPromoTemplates = (_req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: "summer-sale",
        name: "Summer Sale",
        title: "Summer Sale - Up to 50% OFF!",
        content:
          "Get ready for summer with our exclusive collection! Enjoy up to 50% discount on skincare and fragrance products. Limited time offer!",
        discount: "50%",
        expiryDate: "2026-06-30",
      },
      {
        id: "new-launch",
        name: "New Product Launch",
        title: "NEW ARRIVALS - Exclusive Products Just In!",
        content:
          "Check out our latest collection of premium cosmetics and skincare products. First 100 customers get an exclusive gift!",
        discount: "20%",
        expiryDate: "2026-05-31",
      },
      {
        id: "loyalty-rewards",
        name: "Loyalty Rewards",
        title: "Loyalty Rewards - Special Offer for You!",
        content:
          "Thank you for being a loyal customer! Here's a special 25% discount exclusively for you. Valid for all products!",
        discount: "25%",
        expiryDate: "2026-05-15",
      },
      {
        id: "flash-sale",
        name: "Flash Sale",
        title: "FLASH SALE - 48 Hours Only!",
        content:
          "Don't miss our 48-hour flash sale! Get up to 40% off on selected items. Hurry, stock is limited!",
        discount: "40%",
        expiryDate: "2026-04-26",
      },
    ];

    return res.status(200).json({
      success: true,
      templates,
    });
  } catch (error: any) {
    console.error("GET PROMO TEMPLATES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};
