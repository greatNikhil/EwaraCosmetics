import assert from "node:assert/strict";
import Product from "../models/Product";
import Review from "../models/review";
import { deleteReview } from "../controllers/review.controller";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalReviewFindByPk = (Review as any).findByPk;
const originalReviewCount = (Review as any).count;
const originalReviewSum = (Review as any).sum;
const originalProductUpdate = (Product as any).update;

export const runReviewControllerTests = async () => {
  const invalidReq = createMockRequest({
    params: { id: "bad-id" } as any,
  });
  const invalidRes = createMockResponse();

  await deleteReview(invalidReq as any, invalidRes as any);

  assert.equal(invalidRes.statusCode, 400);
  assert.deepEqual(invalidRes.body, {
    success: false,
    message: "Invalid review ID",
  });

  (Review as any).findByPk = async () => null;

  const missingReq = createMockRequest({
    params: { id: "11" } as any,
  });
  const missingRes = createMockResponse();

  await deleteReview(missingReq as any, missingRes as any);

  assert.equal(missingRes.statusCode, 404);
  assert.deepEqual(missingRes.body, {
    success: false,
    message: "Review not found",
  });

  let deletedId = 0;
  let updatedProductWhereId = 0;

  (Review as any).findByPk = async () => ({
    id: 12,
    product: 99,
    destroy: async function () {
      deletedId = this.id;
    },
  });
  (Review as any).count = async () => 0;
  (Review as any).sum = async () => 0;
  (Product as any).update = async (_values: any, options: any) => {
    updatedProductWhereId = options?.where?.id;
  };

  const successReq = createMockRequest({
    params: { id: "12" } as any,
  });
  const successRes = createMockResponse();

  await deleteReview(successReq as any, successRes as any);

  assert.equal(successRes.statusCode, 200);
  assert.equal(deletedId, 12);
  assert.equal(updatedProductWhereId, 99);

  (Review as any).findByPk = originalReviewFindByPk;
  (Review as any).count = originalReviewCount;
  (Review as any).sum = originalReviewSum;
  (Product as any).update = originalProductUpdate;
};
