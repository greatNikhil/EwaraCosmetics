import { Router } from "express";
import {
  createOffer,
  deleteOffer,
  getActiveOffers,
  getAdminOffers,
  updateOffer,
} from "../controllers/offer.controller";
import authMiddleware from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import {
  validateAdminOfferRequest,
  validateObjectIdParam,
} from "../middleware/validation";

const router = Router();

router.get("/", getActiveOffers);
router.get("/admin", authMiddleware, adminMiddleware, getAdminOffers);
router.post("/", authMiddleware, adminMiddleware, validateAdminOfferRequest, createOffer);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectIdParam(),
  validateAdminOfferRequest,
  updateOffer
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectIdParam(),
  deleteOffer
);

export default router;
