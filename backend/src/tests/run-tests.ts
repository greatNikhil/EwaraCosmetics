import { runAdminControllerTests } from "./adminController.test";
import { runAddressControllerTests } from "./addressController.test";
import { runAuthControllerTests } from "./authController.test";
import { runCouponTests } from "./coupon.test";
import { runCouponControllerTests } from "./couponController.test";
import { runEnvTests } from "./env.test";
import { runOrderControllerTests } from "./orderController.test";
import { runPromoControllerTests } from "./promoController.test";
import { runRateLimitTests } from "./rateLimit.test";
import { runReviewControllerTests } from "./reviewController.test";
import { runValidationTests } from "./validation.test";

const tests = [
  { name: "env", run: runEnvTests },
  { name: "rateLimit", run: runRateLimitTests },
  { name: "validation", run: runValidationTests },
  { name: "addressController", run: runAddressControllerTests },
  { name: "authController", run: runAuthControllerTests },
  { name: "coupon", run: runCouponTests },
  { name: "couponController", run: runCouponControllerTests },
  { name: "adminController", run: runAdminControllerTests },
  { name: "orderController", run: runOrderControllerTests },
  { name: "promoController", run: runPromoControllerTests },
  { name: "reviewController", run: runReviewControllerTests },
];

const run = async () => {
  let passed = 0;

  for (const test of tests) {
    try {
      await test.run();
      passed += 1;
      console.log(`PASS ${test.name}`);
    } catch (error) {
      console.error(`FAIL ${test.name}`);
      throw error;
    }
  }

  console.log(`Passed ${passed}/${tests.length} tests`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
