import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getMyAddresses,
  updateAddress,
} from "../controllers/address.controller";
import {
  validateAddressCreateRequest,
  validateAddressUpdateRequest,
  validateObjectIdParam,
} from "../middleware/validation";

const router = Router();

router.get("/", authMiddleware, getMyAddresses);
router.get("/:id", authMiddleware, validateObjectIdParam(), getAddressById);
router.post("/", authMiddleware, validateAddressCreateRequest, createAddress);
router.put(
  "/:id",
  authMiddleware,
  validateObjectIdParam(),
  validateAddressUpdateRequest,
  updateAddress
);
router.delete("/:id", authMiddleware, validateObjectIdParam(), deleteAddress);

export default router;
