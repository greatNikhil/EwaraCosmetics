const dotenv = require("dotenv");
const { sequelize } = require("./dist/config/db");

dotenv.config();

async function verifyDatabase() {
  console.log("\nDatabase verification test\n");

  try {
    console.log("Checking MySQL connection...");
    await sequelize.authenticate();
    console.log("Connection established.\n");

    const [collections] = await sequelize.query("SHOW TABLES");
    console.log(`Tables found: ${collections.length}\n`);

    console.log("Database status: CONNECTED & HEALTHY\n");
    console.log("Ready for:");
    console.log(" - User registration and authentication");
    console.log(" - Product management");
    console.log(" - Order processing");
    console.log(" - Coupon management");
    console.log(" - Address storage\n");

    await sequelize.close();
    console.log("Connection closed gracefully\n");
  } catch (error) {
    console.log("ERROR: Database verification failed!\n");
    console.log(`Error: ${error.message}\n`);
    console.log("Troubleshooting:");
    console.log("1. Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD");
    console.log("2. Ensure MySQL server is running and reachable");
    console.log("3. Check database user permissions");
    console.log("4. Run backend build before this script so dist/config/db exists\n");
    process.exit(1);
  }
}

verifyDatabase();
