/**
 * Fix Test User Password
 * 
 * Usage (from backend directory):
 * npx ts-node scripts/fix-test-user-password.ts
 * 
 * This script updates the test user password to a working one
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import User from "../src/models/user";
import connectDB from "../src/config/db";

dotenv.config();

async function fixTestUserPassword() {
  try {
    console.log("\n🔐 Fixing test user password...\n");

    // Connect to DB
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Find test user
    let testUser = await User.findOne({ email: "test@ewara.com" });

    if (!testUser) {
      console.log("❌ Test user not found!");
      console.log("Creating new test user...\n");
      
      const hashedPassword = await bcryptjs.hash("password", 10);
      testUser = await User.create({
        name: "Test Customer",
        email: "test@ewara.com",
        phone: "9876543210",
        password: hashedPassword,
        role: "user",
      });
      console.log("✅ Test user created with password: 'password'\n");
    } else {
      console.log("✅ Found existing test user");
      console.log("   Email:", testUser.email);
      console.log("   Updating password...\n");
      
      const hashedPassword = await bcryptjs.hash("password", 10);
      testUser.password = hashedPassword;
      await testUser.save();
      console.log("✅ Password updated!\n");
    }

    console.log("📋 Test User Login Credentials:");
    console.log("   📧 Email: test@ewara.com");
    console.log("   🔑 Password: password\n");

    console.log("✅ Fix complete!\n");
    console.log("Now try logging in with:");
    console.log("   Email: test@ewara.com");
    console.log("   Password: password\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  }
}

// Run
fixTestUserPassword();
