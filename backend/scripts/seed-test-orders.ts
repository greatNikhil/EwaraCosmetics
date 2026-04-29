import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB, { sequelize } from "../src/config/db";
import User from "../src/models/user";
import Order from "../src/models/order.model";

dotenv.config();

const testProducts = [
  {
    productId: 101,
    name: "Vitamin C Serum",
    price: 1299,
    image: "https://via.placeholder.com/200?text=Vitamin+C",
  },
  {
    productId: 102,
    name: "Moisturizing Cream",
    price: 899,
    image: "https://via.placeholder.com/200?text=Moisturizer",
  },
  {
    productId: 103,
    name: "Face Wash",
    price: 499,
    image: "https://via.placeholder.com/200?text=Face+Wash",
  },
];

async function seedTestOrders() {
  try {
    console.log("\nSeeding test orders...\n");

    await connectDB();
    console.log("Connected to MySQL\n");

    let testUser = await User.findOne({ where: { email: "test@ewara.com" } });

    if (!testUser) {
      console.log("Creating test user...");
      testUser = await User.create({
        name: "Test Customer",
        email: "test@ewara.com",
        phone: "9876543210",
        password: await bcrypt.hash("password", 10),
        role: "user",
      });
      console.log(`Test user created: ${testUser.id}`);
    } else {
      console.log(`Using existing test user: ${testUser.id}`);
    }

    console.log("");

    const deletedCount = await Order.destroy({
      where: { user: testUser.id },
    });
    console.log(`Cleared ${deletedCount} old test orders\n`);

    const testOrders = [
      {
        user: testUser.id,
        items: [
          {
            productId: testProducts[0].productId,
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
        updatedAt: new Date(),
      },
      {
        user: testUser.id,
        items: [
          {
            productId: testProducts[1].productId,
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
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user: testUser.id,
        items: [
          {
            productId: testProducts[0].productId,
            name: testProducts[0].name,
            price: testProducts[0].price,
            quantity: 1,
            image: testProducts[0].image,
          },
          {
            productId: testProducts[2].productId,
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
        razorpayPaymentId: "pay_test_002",
        razorpayOrderId: "order_test_002",
        stockRestored: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdOrders = await Order.bulkCreate(testOrders as any);
    console.log("Created 3 test orders:\n");

    createdOrders.forEach((order, index) => {
      console.log(`   Order ${index + 1}: ${order.id}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Payment: ${order.paymentMethod} (${order.paymentStatus})`);
      console.log(`      Total: Rs. ${order.totalAmount}`);
      console.log(`      Items: ${order.items.length}`);
      console.log(`      Created: ${order.createdAt?.toDateString() || "Today"}`);
      console.log("");
    });

    console.log(`Test User ID: ${testUser.id}`);
    console.log("Test Email: test@ewara.com\n");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\nSeeding error:", (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }
}

seedTestOrders();
