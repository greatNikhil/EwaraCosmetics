import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import connectDB, { sequelize } from "../src/config/db";
import User from "../src/models/user";

dotenv.config({ path: "../.env" });

async function createAdminUser() {
  try {
    console.log("Creating admin user for testing...");

    await connectDB();
    console.log("Connected to MySQL");

    const existingAdmin = await User.findOne({
      where: { email: "admin@ewara.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists: admin@ewara.com");
      console.log(`   User ID: ${existingAdmin.id}`);
      console.log(`   Role: ${existingAdmin.role}`);

      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("Updated user role to 'admin'");
      }

      console.log("\nAdmin Login Credentials:");
      console.log("   Email: admin@ewara.com");
      console.log("   Password: admin123");

      await sequelize.close();
      return;
    }

    const hashedPassword = await bcryptjs.hash("admin123", 10);
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@ewara.com",
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log(`   User ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);

    console.log("\nAdmin Login Credentials:");
    console.log("   Email: admin@ewara.com");
    console.log("   Password: admin123");

    await sequelize.close();
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createAdminUser();
