import assert from "node:assert/strict";
import Address from "../models/address";
import {
  getAddressById,
  getMyAddresses,
} from "../controllers/address.controller";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalAddressFind = (Address as any).find;
const originalAddressFindAll = (Address as any).findAll;
const originalAddressFindOne = (Address as any).findOne;

export const runAddressControllerTests = async () => {
  try {
    let findAllOptions: any = null;
    (Address as any).findAll = async (options: any) => {
      findAllOptions = options;
      return [];
    };

    const myAddressesReq = createMockRequest({
      user: { id: "101" } as any,
    });
    const myAddressesRes = createMockResponse();

    await getMyAddresses(myAddressesReq as any, myAddressesRes as any);

    assert.equal(myAddressesRes.statusCode, 200);
    assert.deepEqual(findAllOptions, {
      where: { user: 101 },
      order: [
        ["default", "DESC"],
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    let findOneOptions: any = null;
    (Address as any).findOne = async (options: any) => {
      findOneOptions = options;
      return null;
    };

    const otherUserReq = createMockRequest({
      params: { id: "202" } as any,
      user: { id: "303" } as any,
    });
    const otherUserRes = createMockResponse();

    await getAddressById(otherUserReq as any, otherUserRes as any);

    assert.equal(otherUserRes.statusCode, 404);
    assert.deepEqual(findOneOptions, {
      where: {
        id: 202,
        user: 303,
      },
    });
    assert.deepEqual(otherUserRes.body, {
      success: false,
      message: "Address not found",
    });
  } finally {
    (Address as any).find = originalAddressFind;
    (Address as any).findAll = originalAddressFindAll;
    (Address as any).findOne = originalAddressFindOne;
  }
};
