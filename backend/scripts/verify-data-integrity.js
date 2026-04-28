/**
 * Phase 8 data integrity verification.
 *
 * Usage:
 *   cd backend
 *   node scripts/verify-data-integrity.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const requireEnv = (name) => {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return String(value).trim();
};

const collectionExists = async (db, name) => {
  const matches = await db.listCollections({ name }).toArray();
  return matches.length > 0;
};

const countDuplicates = async (collection, groupId) => {
  const duplicates = await collection
    .aggregate([
      { $group: { _id: groupId, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "total" },
    ])
    .toArray();

  return duplicates[0]?.total || 0;
};

async function main() {
  const mongoUri = requireEnv("MONGO_URI");

  await mongoose.connect(mongoUri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  const db = mongoose.connection.db;
  const summary = [];
  const issues = [];

  const checks = [
    {
      label: "products count",
      run: async () => db.collection("products").countDocuments(),
    },
    {
      label: "orders count",
      run: async () => db.collection("orders").countDocuments(),
    },
    {
      label: "orders missing user",
      run: async () =>
        db.collection("orders").countDocuments({ user: { $exists: false } }),
      expectZero: true,
      failureMessage: "Some orders are missing the user field.",
    },
    {
      label: "orders missing items",
      run: async () =>
        db.collection("orders").countDocuments({
          $or: [{ items: { $exists: false } }, { items: { $size: 0 } }],
        }),
      expectZero: true,
      failureMessage: "Some orders have no order items.",
    },
    {
      label: "orders missing paymentStatus",
      run: async () =>
        db.collection("orders").countDocuments({
          paymentStatus: { $exists: false },
        }),
      expectZero: true,
      failureMessage: "Some orders are missing paymentStatus.",
    },
    {
      label: "orders duplicate _id groups",
      run: async () =>
        countDuplicates(db.collection("orders"), "$_id"),
      expectZero: true,
      failureMessage: "Duplicate order _id groups found.",
    },
  ];

  if (await collectionExists(db, "cartitems")) {
    checks.push(
      {
        label: "cartitems count",
        run: async () => db.collection("cartitems").countDocuments(),
      },
      {
        label: "cartitems duplicate userId+productId groups",
        run: async () =>
          countDuplicates(db.collection("cartitems"), {
            userId: "$userId",
            productId: "$productId",
          }),
        expectZero: true,
        failureMessage: "Duplicate cart items found for the same user/product.",
      }
    );
  }

  if (await collectionExists(db, "wishlistitems")) {
    checks.push(
      {
        label: "wishlistitems count",
        run: async () => db.collection("wishlistitems").countDocuments(),
      },
      {
        label: "wishlistitems duplicate userId+productId groups",
        run: async () =>
          countDuplicates(db.collection("wishlistitems"), {
            userId: "$userId",
            productId: "$productId",
          }),
        expectZero: true,
        failureMessage:
          "Duplicate wishlist items found for the same user/product.",
      }
    );
  }

  if (await collectionExists(db, "addresses")) {
    checks.push({
      label: "addresses missing user",
      run: async () =>
        db.collection("addresses").countDocuments({ user: { $exists: false } }),
      expectZero: true,
      failureMessage: "Some addresses are missing the user field.",
    });
  }

  if (await collectionExists(db, "coupons")) {
    checks.push({
      label: "coupons duplicate code groups",
      run: async () =>
        countDuplicates(db.collection("coupons"), {
          code: { $toUpper: "$code" },
        }),
      expectZero: true,
      failureMessage: "Duplicate coupon codes found.",
    });
  }

  for (const check of checks) {
    const value = await check.run();
    summary.push({ label: check.label, value });

    if (check.expectZero && value !== 0) {
      issues.push(`${check.failureMessage} Count: ${value}`);
    }
  }

  console.log("Phase 8 data integrity summary");
  console.log("--------------------------------");

  for (const item of summary) {
    console.log(`${item.label}: ${item.value}`);
  }

  if (issues.length > 0) {
    console.log("");
    console.log("Integrity issues detected:");
    for (const issue of issues) {
      console.log(`- ${issue}`);
    }
    process.exitCode = 1;
  } else {
    console.log("");
    console.log("All integrity checks passed.");
  }
}

main()
  .catch((error) => {
    console.error("Data integrity verification failed:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
