import { Router } from "express";
import NewsletterSubscriber from "../models/newsletterSubscriber";

const router = Router();

router.post("/subscribe", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingSubscriber = await NewsletterSubscriber.findOne({
      where: { email },
    });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
      }

      return res.status(200).json({
        success: true,
        message: "You're already subscribed.",
      });
    }

    await NewsletterSubscriber.create({ email });

    return res.status(201).json({
      success: true,
      message: "Subscribed successfully.",
    });
  } catch (error) {
    console.error("NEWSLETTER SUBSCRIBE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to subscribe right now",
    });
  }
});

export default router;
