import assert from "node:assert/strict";
import Product from "../models/Product";
import Review from "../models/review";
import { deleteReview } from "../controllers/review.controller";
import { createMockRequest, createMockResponse } from "./helpers/mockExpress";

const originalReviewFindById = (Review as any).findById;
const originalReviewFindByIdAndDelete = (Review as any).findByIdAndDelete;
const originalReviewAggregate = (Review as any).aggregate;
const originalProductFindByIdAndUpdate = (Product as any).findByIdAndUpdate;

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

  (Review as any).findById = async () => null;

  const missingReq = createMockRequest({
    params: { id: "507f1f77bcf86cd799439011" } as any,
  });
  const missingRes = createMockResponse();

  await deleteReview(missingReq as any, missingRes as any);

  assert.equal(missingRes.statusCode, 404);
  assert.deepEqual(missingRes.body, {
    success: false,
    message: "Review not found",
  });

  let deletedId = "";
  let updatedProductId = "";

  (Review as any).findById = async () => ({
    _id: "507f1f77bcf86cd799439012",
    product: { toString: () => "507f1f77bcf86cd799439099" },
  });
  (Review as any).findByIdAndDelete = async (id: string) => {
    deletedId = id;
  };
  (Review as any).aggregate = async () => [];
  (Product as any).findByIdAndUpdate = async (id: string) => {
    updatedProductId = id;
  };

  const successReq = createMockRequest({
    params: { id: "507f1f77bcf86cd799439012" } as any,
  });
  const successRes = createMockResponse();

  await deleteReview(successReq as any, successRes as any);

  assert.equal(successRes.statusCode, 200);
  assert.equal(deletedId, "507f1f77bcf86cd799439012");
  assert.equal(updatedProductId, "507f1f77bcf86cd799439099");

  (Review as any).findById = originalReviewFindById;
  (Review as any).findByIdAndDelete = originalReviewFindByIdAndDelete;
  (Review as any).aggregate = originalReviewAggregate;
  (Product as any).findByIdAndUpdate = originalProductFindByIdAndUpdate;
};
