import { Request, Response } from "express";
import Offer from "../models/offer";

const serializeOffer = (offer: Offer) => {
  const plain = offer.get({ plain: true });
  return { ...plain, _id: plain.id };
};

export const getActiveOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await Offer.findAll({
      where: { isActive: true },
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: offers.length,
      offers: offers.map((offer) => serializeOffer(offer)),
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
    const offers = await Offer.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: offers.length,
      offers: offers.map((offer) => serializeOffer(offer)),
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
      offer: serializeOffer(offer),
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
    const offerId = Number(req.params.id);
    const { text, isActive, displayOrder } = req.body;

    const offer = await Offer.findByPk(offerId);

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
      offer: serializeOffer(offer),
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
    const offerId = Number(req.params.id);
    const offer = await Offer.findByPk(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await offer.destroy();

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
