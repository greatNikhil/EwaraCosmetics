import { Response } from "express";
import mongoose from "mongoose";
import Address from "../models/address";

const clearExistingDefault = async (userId: string, excludeId?: string) => {
  const filter: Record<string, unknown> = {
    user: userId,
    default: true,
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  await Address.updateMany(filter, { $set: { default: false } });
};

export const getMyAddresses = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const addresses = await Address.find({ user: userId }).sort({
      default: -1,
      updatedAt: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error: any) {
    console.error("GET ADDRESSES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch addresses",
    });
  }
};

export const getAddressById = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const address = await Address.findOne({ _id: id, user: userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error: any) {
    console.error("GET ADDRESS BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch address",
    });
  }
};

export const createAddress = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      name,
      lastname,
      address,
      phone,
      pincode,
      flat,
      city,
      state,
      default: isDefault,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!name || !address || !phone || !pincode || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields",
      });
    }

    const existingCount = await Address.countDocuments({ user: userId });
    const shouldSetDefault = Boolean(isDefault) || existingCount === 0;

    if (shouldSetDefault) {
      await clearExistingDefault(userId);
    }

    const newAddress = await Address.create({
      user: userId,
      name: name.trim(),
      lastname: lastname?.trim() || "",
      address: address.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      flat: flat?.trim() || "",
      city: city.trim(),
      state: state.trim(),
      default: shouldSetDefault,
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      address: newAddress,
    });
  } catch (error: any) {
    console.error("CREATE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create address",
    });
  }
};

export const updateAddress = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const existingAddress = await Address.findOne({ _id: id, user: userId });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const updatedData = {
      ...(req.body.name !== undefined && { name: String(req.body.name).trim() }),
      ...(req.body.lastname !== undefined && {
        lastname: String(req.body.lastname || "").trim(),
      }),
      ...(req.body.address !== undefined && {
        address: String(req.body.address).trim(),
      }),
      ...(req.body.phone !== undefined && { phone: String(req.body.phone).trim() }),
      ...(req.body.pincode !== undefined && {
        pincode: String(req.body.pincode).trim(),
      }),
      ...(req.body.flat !== undefined && { flat: String(req.body.flat || "").trim() }),
      ...(req.body.city !== undefined && { city: String(req.body.city).trim() }),
      ...(req.body.state !== undefined && { state: String(req.body.state).trim() }),
    };

    if (
      updatedData.name === "" ||
      updatedData.address === "" ||
      updatedData.phone === "" ||
      updatedData.pincode === "" ||
      updatedData.city === "" ||
      updatedData.state === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Required address fields cannot be empty",
      });
    }

    const shouldSetDefault = req.body.default === true;

    if (shouldSetDefault) {
      await clearExistingDefault(userId, id);
      existingAddress.default = true;
    } else if (req.body.default === false) {
      const otherDefault = await Address.findOne({
        user: userId,
        default: true,
        _id: { $ne: id },
      });

      existingAddress.default = Boolean(otherDefault) ? false : true;
    }

    Object.assign(existingAddress, updatedData);
    await existingAddress.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: existingAddress,
    });
  } catch (error: any) {
    console.error("UPDATE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update address",
    });
  }
};

export const deleteAddress = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const address = await Address.findOne({ _id: id, user: userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.default;

    await Address.deleteOne({ _id: id, user: userId });

    if (wasDefault) {
      const nextAddress = await Address.findOne({ user: userId }).sort({
        updatedAt: -1,
        createdAt: -1,
      });

      if (nextAddress) {
        nextAddress.default = true;
        await nextAddress.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete address",
    });
  }
};
