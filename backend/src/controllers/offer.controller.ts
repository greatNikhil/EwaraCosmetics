import { Request, Response } from "express";
import Offer from "../models/offer";

export const getActiveOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await Offer.find({ isActive: true }).sort({
      displayOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offers",
    });
  }
};

export const getAdminOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await Offer.find().sort({
      displayOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offers",
    });
  }
};

export const createOffer = async (req: Request, res: Response) => {
  try {
    const { text, isActive, displayOrder } = req.body;

    const offer = await Offer.create({
      text: String(text).trim(),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: Number(displayOrder || 0),
    });

    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create offer",
    });
  }
};

export const updateOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, isActive, displayOrder } = req.body;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (text !== undefined) {
      offer.text = String(text).trim();
    }

    if (isActive !== undefined) {
      offer.isActive = Boolean(isActive);
    }

    if (displayOrder !== undefined) {
      offer.displayOrder = Number(displayOrder);
    }

    await offer.save();

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update offer",
    });
  }
};

export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await Offer.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete offer",
    });
  }
};
