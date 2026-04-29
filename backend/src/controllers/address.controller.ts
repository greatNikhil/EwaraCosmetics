import { Response } from "express";
import { Op } from "sequelize";
import Address from "../models/address";

const serializeAddress = (address: Address) => {
  const plain = address.get({ plain: true });
  return { ...plain, _id: plain.id };
};

const clearExistingDefault = async (userId: number, excludeId?: number) => {
  const where: Record<string, unknown> = {
    user: userId,
    default: true,
  };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  await Address.update({ default: false }, { where });
};

export const getMyAddresses = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const addresses = await Address.findAll({
      where: { user: userId },
      order: [
        ["default", "DESC"],
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      addresses: addresses.map((address) => serializeAddress(address)),
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
    const userId = Number(req.user?.id);
    const addressId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!addressId || Number.isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const address = await Address.findOne({
      where: { id: addressId, user: userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      address: serializeAddress(address),
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
    const userId = Number(req.user?.id);
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

    const existingCount = await Address.count({ where: { user: userId } });
    const shouldSetDefault = Boolean(isDefault) || existingCount === 0;

    if (shouldSetDefault) {
      await clearExistingDefault(userId);
    }

    const newAddress = await Address.create({
      user: userId,
      name: String(name).trim(),
      lastname: String(lastname || "").trim(),
      address: String(address).trim(),
      phone: String(phone).trim(),
      pincode: String(pincode).trim(),
      flat: String(flat || "").trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      default: shouldSetDefault,
    });

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      address: serializeAddress(newAddress),
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
    const userId = Number(req.user?.id);
    const addressId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!addressId || Number.isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const existingAddress = await Address.findOne({
      where: { id: addressId, user: userId },
    });

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

    if (req.body.default === true) {
      await clearExistingDefault(userId, addressId);
      existingAddress.default = true;
    } else if (req.body.default === false) {
      const otherDefault = await Address.findOne({
        where: {
          user: userId,
          default: true,
          id: { [Op.ne]: addressId },
        },
      });

      existingAddress.default = Boolean(otherDefault) ? false : true;
    }

    Object.assign(existingAddress, updatedData);
    await existingAddress.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: serializeAddress(existingAddress),
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
    const userId = Number(req.user?.id);
    const addressId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!addressId || Number.isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const address = await Address.findOne({
      where: { id: addressId, user: userId },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.default;
    await address.destroy();

    if (wasDefault) {
      const nextAddress = await Address.findOne({
        where: { user: userId },
        order: [
          ["updatedAt", "DESC"],
          ["createdAt", "DESC"],
        ],
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
