import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/user";
import Order from "../src/models/order.model";
import Product from "../src/models/Product";

dotenv.config({ path: "../.env" });

async function verifyDashboardMetrics() {
  try {
    console.log("📊 Verifying Dashboard Metrics for Step 3.1...\n");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ewara");
    console.log("✅ Connected to MongoDB\n");

    // Get actual metrics from database
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Get revenue (sum of completed/refunded orders)
    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: { $in: ["Completed", "Refunded"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email phone role createdAt");

    // Get low stock products
    const lowStockProducts = await Product.find({ countInStock: { $lte: 5 } })
      .sort({ countInStock: 1, updatedAt: -1 })
      .limit(5)
      .select("name slug countInStock price isPublished");

    // Get order status breakdown
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const ordersByStatus = statusBreakdown.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    );

    // Display results
    console.log("📈 DATABASE METRICS (What API should return):\n");
    console.log(`   📊 Total Users:        ${totalUsers}`);
    console.log(`   📦 Total Products:     ${totalProducts}`);
    console.log(`   🛒 Total Orders:       ${totalOrders}`);
    console.log(`   💰 Total Revenue:      Rs. ${totalRevenue.toLocaleString('en-IN')}`);
    console.log(`   📝 Payment Completed:  ${revenueResult[0] ? "✓" : "✗"}\n`);

    console.log("📋 ORDER STATUS BREAKDOWN:\n");
    console.log(`   ⏳ Pending:    ${ordersByStatus.Pending || 0}`);
    console.log(`   ⚙️  Processing: ${ordersByStatus.Processing || 0}`);
    console.log(`   📦 Shipped:    ${ordersByStatus.Shipped || 0}`);
    console.log(`   ✅ Delivered:  ${ordersByStatus.Delivered || 0}`);
    console.log(`   ❌ Cancelled:  ${ordersByStatus.Cancelled || 0}\n`);

    console.log("👥 RECENT ORDERS (5 latest):\n");
    recentOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order ID: ${order._id}`);
      console.log(`      Customer: ${(order.user as any)?.name || "Unknown"} (${(order.user as any)?.email})`);
      console.log(`      Amount: Rs. ${order.totalAmount}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Date: ${new Date(order.createdAt).toLocaleDateString()}\n`);
    });

    console.log("👤 RECENT USERS (5 latest):\n");
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      Phone: ${user.phone}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Joined: ${new Date(user.createdAt!).toLocaleDateString()}\n`);
    });

    console.log("⚠️  LOW STOCK PRODUCTS (Stock ≤ 5):\n");
    if (lowStockProducts.length === 0) {
      console.log("   ✅ All products have healthy stock levels\n");
    } else {
      lowStockProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Stock: ${product.countInStock}`);
        console.log(`      Price: Rs. ${product.price}`);
        console.log(`      Published: ${product.isPublished}\n`);
      });
    }

    console.log("\n✅ Verification complete!");
    console.log("\n📌 USE THESE METRICS TO VERIFY API RESPONSE:");
    console.log(`   Expected totalUsers:    ${totalUsers}`);
    console.log(`   Expected totalProducts: ${totalProducts}`);
    console.log(`   Expected totalOrders:   ${totalOrders}`);
    console.log(`   Expected totalRevenue:  ${totalRevenue}`);

    await mongoose.connection.close();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

verifyDashboardMetrics();
