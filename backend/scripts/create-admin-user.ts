import dotenv from "dotenv";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import User from "../src/models/user";

dotenv.config({ path: "../.env" });

async function createAdminUser() {
  try {
    console.log("🔐 Creating admin user for Step 3.1 testing...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ewara");
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@ewara.com" });
    if (existingAdmin) {
      console.log("✅ Admin user already exists: admin@ewara.com");
      console.log(`   User ID: ${existingAdmin._id}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // If not admin role, update it
      if (existingAdmin.role !== "admin") {
        await User.updateOne({ _id: existingAdmin._id }, { role: "admin" });
        console.log("🔄 Updated user role to 'admin'");
      }
      
      console.log("\n📋 Admin Login Credentials:");
      console.log("   📧 Email: admin@ewara.com");
      console.log("   🔑 Password: admin123");
      
      await mongoose.connection.close();
      return;
    }

    // Create new admin user
    const hashedPassword = await bcryptjs.hash("admin123", 10);
    const adminUser = new User({
      name: "Admin User",
      email: "admin@ewara.com",
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
      verified: true,
      emailVerified: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log(`   User ID: ${adminUser._id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);

    console.log("\n📋 Admin Login Credentials:");
    console.log("   📧 Email: admin@ewara.com");
    console.log("   🔑 Password: admin123");

    console.log("\n✅ Setup complete!");
    await mongoose.connection.close();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdminUser();
