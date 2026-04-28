/**
 * Backfill missing paymentStatus values on legacy orders.
 *
 * Usage:
 *   cd backend
 *   node scripts/backfill-order-payment-status.js
 *   node scripts/backfill-order-payment-status.js --apply
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const orderSchema = new mongoose.Schema(
  {
    paymentMethod: String,
    paymentStatus: String,
    razorpayPaymentId: String,
    status: String,
  },
  { collection: "orders", strict: false }
);

const Order = mongoose.models.OrderBackfill ||
  mongoose.model("OrderBackfill", orderSchema);

const resolvePaymentStatus = (order) => {
  const paymentMethod = String(order.paymentMethod || "").toLowerCase();

  if (order.razorpayPaymentId) {
    return "Completed";
  }

  if (paymentMethod.includes("cash") || paymentMethod === "cod") {
    return "Pending";
  }

  return order.status === "Cancelled" ? "Failed" : "Pending";
};

async function main() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Missing required environment variable: MONGO_URI");
  }

  const apply = process.argv.includes("--apply");

  await mongoose.connect(mongoUri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  const orders = await Order.find({
    $or: [
      { paymentStatus: { $exists: false } },
      { paymentStatus: null },
      { paymentStatus: "" },
    ],
  }).lean();

  if (orders.length === 0) {
    console.log("No legacy orders require paymentStatus backfill.");
    return;
  }

  console.log(`Found ${orders.length} orders missing paymentStatus.`);

  for (const order of orders) {
    const nextPaymentStatus = resolvePaymentStatus(order);
    console.log(
      `${order._id}: paymentMethod=${order.paymentMethod || "n/a"}, status=${order.status || "n/a"}, razorpayPaymentId=${order.razorpayPaymentId || "n/a"} -> ${nextPaymentStatus}`
    );
  }

  if (!apply) {
    console.log("");
    console.log("Dry run only. Re-run with --apply to persist updates.");
    return;
  }

  let updated = 0;

  for (const order of orders) {
    const nextPaymentStatus = resolvePaymentStatus(order);
    await Order.updateOne(
      { _id: order._id },
      { $set: { paymentStatus: nextPaymentStatus } }
    );
    updated += 1;
  }

  console.log(`Updated ${updated} orders.`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
