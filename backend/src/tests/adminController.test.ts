import assert from "node:assert/strict";
import User from "../models/user";
import { updateUserRole } from "../controllers/admin.controller";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalFindById = (User as any).findById;

export const runAdminControllerTests = async () => {
  const selfRoleReq = createMockRequest({
    params: { id: "507f1f77bcf86cd799439011" } as any,
    body: { role: "admin" },
    user: { id: "507f1f77bcf86cd799439011" } as any,
  });
  const selfRoleRes = createMockResponse();

  await updateUserRole(selfRoleReq as any, selfRoleRes as any);

  assert.equal(selfRoleRes.statusCode, 400);
  assert.deepEqual(selfRoleRes.body, {
    success: false,
    message: "You cannot change your own role",
  });

  (User as any).findById = () => ({
    select: async () => null,
  });

  const missingUserReq = createMockRequest({
    params: { id: "507f1f77bcf86cd799439012" } as any,
    body: { role: "admin" },
    user: { id: "507f1f77bcf86cd799439013" } as any,
  });
  const missingUserRes = createMockResponse();

  await updateUserRole(missingUserReq as any, missingUserRes as any);

  assert.equal(missingUserRes.statusCode, 404);
  assert.deepEqual(missingUserRes.body, {
    success: false,
    message: "User not found",
  });

  const userRecord = {
    _id: "507f1f77bcf86cd799439014",
    role: "user",
    save: async function () {
      return this;
    },
  };

  (User as any).findById = () => ({
    select: async () => userRecord,
  });

  const successReq = createMockRequest({
    params: { id: "507f1f77bcf86cd799439014" } as any,
    body: { role: "admin" },
    user: { id: "507f1f77bcf86cd799439015" } as any,
  });
  const successRes = createMockResponse();

  await updateUserRole(successReq as any, successRes as any);

  assert.equal(successRes.statusCode, 200);
  assert.equal(userRecord.role, "admin");

  (User as any).findById = originalFindById;
};
