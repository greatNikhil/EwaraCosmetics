import assert from "node:assert/strict";
import User from "../models/user";
import { updateUserRole } from "../controllers/admin.controller";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalFindById = (User as any).findById;
const originalFindByPk = (User as any).findByPk;

export const runAdminControllerTests = async () => {
  const selfRoleReq = createMockRequest({
    params: { id: "101" } as any,
    body: { role: "admin" },
    user: { id: 101 } as any,
  });
  const selfRoleRes = createMockResponse();

  await updateUserRole(selfRoleReq as any, selfRoleRes as any);

  assert.equal(selfRoleRes.statusCode, 400);
  assert.deepEqual(selfRoleRes.body, {
    success: false,
    message: "You cannot change your own role",
  });

  (User as any).findByPk = async () => null;

  const missingUserReq = createMockRequest({
    params: { id: "102" } as any,
    body: { role: "admin" },
    user: { id: 103 } as any,
  });
  const missingUserRes = createMockResponse();

  await updateUserRole(missingUserReq as any, missingUserRes as any);

  assert.equal(missingUserRes.statusCode, 404);
  assert.deepEqual(missingUserRes.body, {
    success: false,
    message: "User not found",
  });

  const userRecord = {
    id: 104,
    role: "user",
    isDeleted: false,
    save: async function () {
      return this;
    },
    get: function () {
      return this;
    },
  };

  (User as any).findByPk = async () => userRecord;

  const successReq = createMockRequest({
    params: { id: "104" } as any,
    body: { role: "admin" },
    user: { id: 105 } as any,
  });
  const successRes = createMockResponse();

  await updateUserRole(successReq as any, successRes as any);

  assert.equal(successRes.statusCode, 200);
  assert.equal(userRecord.role, "admin");

  (User as any).findById = originalFindById;
  (User as any).findByPk = originalFindByPk;
};
