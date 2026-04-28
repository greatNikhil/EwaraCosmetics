import assert from "node:assert/strict";
import Address from "../models/address";
import {
  getAddressById,
  getMyAddresses,
} from "../controllers/address.controller";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalAddressFind = (Address as any).find;
const originalAddressFindOne = (Address as any).findOne;

export const runAddressControllerTests = async () => {
  try {
    let findFilter: any = null;
    (Address as any).find = (filter: any) => {
      findFilter = filter;
      return {
        sort: async () => [],
      };
    };

    const myAddressesReq = createMockRequest({
      user: { id: "507f1f77bcf86cd799439021" } as any,
    });
    const myAddressesRes = createMockResponse();

    await getMyAddresses(myAddressesReq as any, myAddressesRes as any);

    assert.equal(myAddressesRes.statusCode, 200);
    assert.deepEqual(findFilter, { user: "507f1f77bcf86cd799439021" });

    let findOneFilter: any = null;
    (Address as any).findOne = async (filter: any) => {
      findOneFilter = filter;
      return null;
    };

    const otherUserReq = createMockRequest({
      params: { id: "507f1f77bcf86cd799439022" } as any,
      user: { id: "507f1f77bcf86cd799439023" } as any,
    });
    const otherUserRes = createMockResponse();

    await getAddressById(otherUserReq as any, otherUserRes as any);

    assert.equal(otherUserRes.statusCode, 404);
    assert.deepEqual(findOneFilter, {
      _id: "507f1f77bcf86cd799439022",
      user: "507f1f77bcf86cd799439023",
    });
    assert.deepEqual(otherUserRes.body, {
      success: false,
      message: "Address not found",
    });
  } finally {
    (Address as any).find = originalAddressFind;
    (Address as any).findOne = originalAddressFindOne;
  }
};
