import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../src/models/user";
import mongoose from "mongoose";

dotenv.config({ path: "../.env" });

async function testAdminAPI() {
  try {
    console.log("🧪 Testing Admin Dashboard API - Step 3.1\n");
    
    // Connect to get admin user ID
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ewara");
    console.log("✅ Connected to MongoDB");
    
    const adminUser = await User.findOne({ email: "admin@ewara.com" });
    if (!adminUser) {
      console.error("❌ Admin user not found. Run create-admin-user.ts first.");
      process.exit(1);
    }
    
    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})\n`);

    // Generate JWT token for admin
    const adminToken = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    console.log("📋 ADMIN TOKEN GENERATED");
    console.log(`   Token (first 50 chars): ${adminToken.substring(0, 50)}...\n`);

    // Test 1: Admin can access dashboard
    console.log("🧪 TEST 1: Admin access to dashboard API");
    console.log("   URL: http://localhost:5000/api/admin/dashboard");
    console.log("   Method: GET");
    console.log("   Auth: Bearer Token (Admin)\n");

    const adminResponse = await fetch("http://localhost:5000/api/admin/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const adminData = await adminResponse.json();
    
    if (adminResponse.ok && adminData.success) {
      console.log("✅ PASS: Admin dashboard API returned success\n");
      
      const summary = adminData.summary;
      console.log("📊 API RESPONSE METRICS:\n");
      console.log(`   Total Users:    ${summary.totalUsers}`);
      console.log(`   Total Products: ${summary.totalProducts}`);
      console.log(`   Total Orders:   ${summary.totalOrders}`);
      console.log(`   Total Revenue:  Rs. ${summary.totalRevenue}\n`);

      // Verify metrics match expected values
      console.log("✅ METRIC VERIFICATION:\n");
      console.log(`   ✓ Users:    Expected 7, Got ${summary.totalUsers} ${summary.totalUsers === 7 ? "✅" : "❌"}`);
      console.log(`   ✓ Products: Expected 1, Got ${summary.totalProducts} ${summary.totalProducts === 1 ? "✅" : "❌"}`);
      console.log(`   ✓ Orders:   Expected 13, Got ${summary.totalOrders} ${summary.totalOrders === 13 ? "✅" : "❌"}`);
      console.log(`   ✓ Revenue:  Expected 134761, Got ${summary.totalRevenue} ${summary.totalRevenue === 134761 ? "✅" : "❌"}\n`);

      console.log("📋 ORDER STATUS BREAKDOWN:\n");
      console.log(`   Pending:    ${summary.ordersByStatus.Pending}`);
      console.log(`   Processing: ${summary.ordersByStatus.Processing}`);
      console.log(`   Shipped:    ${summary.ordersByStatus.Shipped}`);
      console.log(`   Delivered:  ${summary.ordersByStatus.Delivered}`);
      console.log(`   Cancelled:  ${summary.ordersByStatus.Cancelled}\n`);

      console.log("📌 RECENT ORDERS:\n");
      summary.recentOrders.slice(0, 3).forEach((order: any, index: number) => {
        console.log(`   ${index + 1}. ${order._id} - ${order.user?.name} - Rs. ${order.totalAmount}`);
      });
      console.log("");

      console.log("📌 RECENT USERS:\n");
      summary.recentUsers.slice(0, 3).forEach((user: any, index: number) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log(`❌ FAIL: API returned error`);
      console.log(`   Status: ${adminResponse.status}`);
      console.log(`   Response: ${JSON.stringify(adminData, null, 2)}\n`);
    }

    // Test 2: Get a regular user token
    console.log("\n🧪 TEST 2: Non-admin access to dashboard API");
    const regularUser = await User.findOne({ email: "test@ewara.com" });
    if (regularUser) {
      const userToken = jwt.sign(
        { id: regularUser._id, email: regularUser.email, role: regularUser.role },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "7d" }
      );

      const userResponse = await fetch("http://localhost:5000/api/admin/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const userData = await userResponse.json();

      if (userResponse.status === 403) {
        console.log("✅ PASS: Non-admin user got 403 Forbidden\n");
        console.log(`   Status: ${userResponse.status}`);
        console.log(`   Response: ${JSON.stringify(userData, null, 2)}\n`);
      } else {
        console.log(`❌ FAIL: Non-admin user should get 403, got ${userResponse.status}\n`);
        console.log(`   Response: ${JSON.stringify(userData, null, 2)}\n`);
      }
    }

    // Test 3: No token
    console.log("🧪 TEST 3: No authentication token\n");
    const noAuthResponse = await fetch("http://localhost:5000/api/admin/dashboard", {
      method: "GET",
    });

    const noAuthData = await noAuthResponse.json();

    if (noAuthResponse.status === 401) {
      console.log("✅ PASS: Request without token got 401 Unauthorized\n");
      console.log(`   Status: ${noAuthResponse.status}`);
      console.log(`   Response: ${JSON.stringify(noAuthData, null, 2)}\n`);
    } else {
      console.log(`❌ FAIL: Request without token should get 401, got ${noAuthResponse.status}\n`);
      console.log(`   Response: ${JSON.stringify(noAuthData, null, 2)}\n`);
    }

    console.log("✅ API Testing Complete!\n");
    console.log("📌 NEXT: Test frontend by logging into admin account:");
    console.log("   Email: admin@ewara.com");
    console.log("   Password: admin123");
    console.log("   URL: http://localhost:3003/admin");

    await mongoose.connection.close();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testAdminAPI();
