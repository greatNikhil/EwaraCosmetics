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

dotenv.config();

// Models already imported from backend

interface TestOrder {
  user: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotalAmount: number;
  couponCode?: string;
  discountAmount: number;
  gstAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    stockRestored: Boolean,
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ewara");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

// Seed orders
async function seedTestOrders() {
  try {
    const Order = mongoose.model("Order", testOrderSchema);

    // Get or create test user
    const User = mongoose.model("User");
    let testUser = await User.findOne({ email: "test@ewara.com" });

    if (!testUser) {
      console.log("📝 Creating test user...");
      testUser = await User.create({
        name: "Test Customer",
        email: "test@ewara.com",
        phone: "9876543210",
        password: "hashed_password_here", // Won't be used, just for seed
        role: "user",
      });
      console.log("✅ Test user created:", testUser._id);
    } else {
      console.log("✅ Using existing test user:", testUser._id);
    }

    // Create test products (mock data)
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

    // Clear old test orders
    const deleteResult = await Order.deleteMany({
      "shippingAddress.fullName": "Test Delivery Address",
    });
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} old test orders`);

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
        totalAmount: testProducts[0].price + Math.round(testProducts[0].price * 0.18),
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
        razorpayPaymentId: "pay_test_1234567890",
        razorpayOrderId: "order_test_1234567890",
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
        discountAmount: 100,
        gstAmount: Math.round((testProducts[1].price * 2 - 100) * 0.18),
        shippingAmount: 50,
        totalAmount:
          testProducts[1].price * 2 - 100 +
          Math.round((testProducts[1].price * 2 - 100) * 0.18) +
          50,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        status: "Pending",
        couponCode: "WELCOME100",
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
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
          Math.round((testProducts[0].price + testProducts[2].price) * 0.18),
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
        razorpayPaymentId: "pay_test_0987654321",
        razorpayOrderId: "order_test_0987654321",
        stockRestored: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    // Insert orders
    const insertedOrders = await Order.insertMany(testOrders);
    console.log(`\n✅ Created ${insertedOrders.length} test orders:\n`);

    insertedOrders.forEach((order, index) => {
      console.log(
        `   Order ${index + 1}: ${order._id}`
      );
      console.log(
        `   - Status: ${order.status}`
      );
      console.log(
        `   - Payment: ${order.paymentMethod} (${order.paymentStatus})`
      );
      console.log(
        `   - Total: Rs. ${order.totalAmount}`
      );
      console.log(
        `   - Items: ${order.items.length}`
      );
      console.log(`   - Created: ${order.createdAt.toDateString()}\n`);
    });

    console.log("📋 Test User ID:", testUser._id);
    console.log(`📧 Test Email: ${testUser.email}`);
    console.log("\n✅ Seeding complete!\n");
    console.log("Next steps:");
    console.log("1. Start backend: cd backend && npm run dev");
    console.log("2. Start frontend: npm run dev");
    console.log(`3. Login with: ${testUser.email} / password`);
    console.log("4. Navigate to /orders to see test orders");
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

// Main
async function main() {
  console.log("\n🌱 Seeding test orders for Step 2.1...\n");
  await connectDB();
  await seedTestOrders();
  await mongoose.disconnect();
  process.exit(0);
}

main();
