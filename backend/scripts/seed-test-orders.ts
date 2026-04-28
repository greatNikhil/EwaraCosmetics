/**
 * Seed Test Orders for Step 2.1 Testing
 * 
 * Usage (from backend directory):
 * ts-node scripts/seed-test-orders.ts
 * or
 * npx ts-node scripts/seed-test-orders.ts
 * 
 * This script creates test orders in MongoDB without requiring payment processing
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user";
import Order from "../src/models/order.model";
import connectDB from "../src/config/db";

dotenv.config();

// Test data
const testProducts = [
  {
    name: "Vitamin C Serum",
    price: 1299,
    image: "https://via.placeholder.com/200?text=Vitamin+C",
  },
  {
    name: "Moisturizing Cream",
    price: 899,
    image: "https://via.placeholder.com/200?text=Moisturizer",
  },
  {
    name: "Face Wash",
    price: 499,
    image: "https://via.placeholder.com/200?text=Face+Wash",
  },
];

// Seed orders
async function seedTestOrders() {
  try {
    console.log("\n🌱 Seeding test orders for Step 2.1...\n");

    // Connect to DB
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Get or create test user
    let testUser = await User.findOne({ email: "test@ewara.com" });

    if (!testUser) {
      console.log("📝 Creating test user...");
      testUser = await User.create({
        name: "Test Customer",
        email: "test@ewara.com",
        phone: "9876543210",
        password: "$2a$10$dummy_hash_password", // Dummy hash
        role: "user",
      });
      console.log("✅ Test user created:", testUser._id);
    } else {
      console.log("✅ Using existing test user:", testUser._id);
    }

    console.log("");

    // Clear old test orders
    const deleteResult = await Order.deleteMany({
      "shippingAddress.fullName": "Test Delivery Address",
    });
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} old test orders\n`);

    // Create 3 test orders with different statuses
    const testOrders = [
      {
        // Order 1: Razorpay - Processing (most recent)
        user: testUser._id,
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            name: testProducts[0].name,
            price: testProducts[0].price,
            quantity: 1,
            image: testProducts[0].image,
          },
        ],
        subtotalAmount: testProducts[0].price,
        discountAmount: 0,
        gstAmount: Math.round(testProducts[0].price * 0.18),
        shippingAmount: 0,
        totalAmount:
          testProducts[0].price + Math.round(testProducts[0].price * 0.18),
        paymentMethod: "Razorpay",
        paymentStatus: "Completed",
        status: "Processing",
        shippingAddress: {
          fullName: "Test Delivery Address",
          phoneNumber: "9876543210",
          addressLine1: "123 Test Street",
          addressLine2: "Apt 456",
          city: "Bangalore",
          state: "Karnataka",
          postalCode: "560001",
          country: "India",
        },
        razorpayPaymentId: "pay_test_001",
        razorpayOrderId: "order_test_001",
        stockRestored: false,
        createdAt: new Date(),
      },
      {
        // Order 2: COD - Pending (2 days ago)
        user: testUser._id,
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            name: testProducts[1].name,
            price: testProducts[1].price,
            quantity: 2,
            image: testProducts[1].image,
          },
        ],
        subtotalAmount: testProducts[1].price * 2,
        couponCode: "WELCOME100",
        discountAmount: 100,
        gstAmount: Math.round((testProducts[1].price * 2 - 100) * 0.18),
        shippingAmount: 50,
        totalAmount:
          testProducts[1].price * 2 -
          100 +
          Math.round((testProducts[1].price * 2 - 100) * 0.18) +
          50,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        status: "Pending",
        shippingAddress: {
          fullName: "Test Delivery Address",
          phoneNumber: "9876543210",
          addressLine1: "123 Test Street",
          addressLine2: "Apt 456",
          city: "Bangalore",
          state: "Karnataka",
          postalCode: "560001",
          country: "India",
        },
        stockRestored: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        // Order 3: Razorpay - Shipped (5 days ago)
        user: testUser._id,
        items: [
          {
            productId: new mongoose.Types.ObjectId(),
            name: testProducts[0].name,
            price: testProducts[0].price,
            quantity: 1,
            image: testProducts[0].image,
          },
          {
            productId: new mongoose.Types.ObjectId(),
            name: testProducts[2].name,
            price: testProducts[2].price,
            quantity: 1,
            image: testProducts[2].image,
          },
        ],
        subtotalAmount: testProducts[0].price + testProducts[2].price,
        discountAmount: 0,
        gstAmount: Math.round(
          (testProducts[0].price + testProducts[2].price) * 0.18
        ),
        shippingAmount: 0,
        totalAmount:
          testProducts[0].price +
          testProducts[2].price +
          Math.round(
            (testProducts[0].price + testProducts[2].price) * 0.18
          ),
        paymentMethod: "Razorpay",
        paymentStatus: "Completed",
        status: "Shipped",
        shippingAddress: {
          fullName: "Test Delivery Address",
          phoneNumber: "9876543210",
          addressLine1: "123 Test Street",
          addressLine2: "Apt 456",
          city: "Bangalore",
          state: "Karnataka",
          postalCode: "560001",
          country: "India",
        },
        razorpayPaymentId: "pay_test_002",
        razorpayOrderId: "order_test_002",
        stockRestored: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    ];

    // Create orders
    const createdOrders = await Order.insertMany(testOrders);
    console.log("✅ Created 3 test orders:\n");

    createdOrders.forEach((order, index) => {
      console.log(`   📦 Order ${index + 1}: ${order._id}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Payment: ${order.paymentMethod} (${order.paymentStatus})`);
      console.log(`      Total: Rs. ${order.totalAmount}`);
      console.log(`      Items: ${order.items.length}`);
      console.log(
        `      Created: ${order.createdAt?.toDateString() || "Today"}`
      );
      console.log("");
    });

    console.log("📋 Test User ID:", testUser._id);
    console.log("📧 Test Email: test@ewara.com\n");

    console.log("✅ Seeding complete!\n");
    console.log("Next steps:");
    console.log("1. Start backend: cd backend && npm run dev");
    console.log("2. Start frontend: npm run dev (from root)");
    console.log("3. Login with: test@ewara.com / password");
    console.log("4. Navigate to /orders to see test orders\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding error:", (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }
}

// Run seeding
seedTestOrders();
