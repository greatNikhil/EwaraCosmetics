import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import connectDB, { sequelize } from "../src/config/db";
import User from "../src/models/user";

dotenv.config({ path: "../.env" });

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "chaubeynikhil649@gmail.com").trim().toLowerCase();
const ADMIN_NAME = (process.env.ADMIN_NAME || "Admin User").trim();
const ADMIN_PHONE = (process.env.ADMIN_PHONE || "9999999999").trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function createAdminUser() {
  try {
    console.log("Creating admin user for testing...");

    await connectDB();
    console.log("Connected to MySQL");

    const existingAdmin = await User.findOne({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
      console.log(`   User ID: ${existingAdmin.id}`);
      console.log(`   Role: ${existingAdmin.role}`);

      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("Updated user role to 'admin'");
      }

      console.log("\nAdmin Login Credentials:");
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);

      await sequelize.close();
      return;
    }

    const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);
    const adminUser = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log(`   User ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);

    console.log("\nAdmin Login Credentials:");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);

    await sequelize.close();
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createAdminUser();
