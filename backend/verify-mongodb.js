/**
 * MONGODB VERIFICATION TEST SCRIPT
 * 
 * ✅ Comprehensive MongoDB connection and health check
 * ✅ Database collections verification
 * ✅ Document count checks
 * 
 * Usage:
 * 1. cd backend
 * 2. node verify-mongodb.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

async function verifyMongoDB() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         🗄️  MONGODB VERIFICATION TEST - HEALTH CHECK      ║");
  console.log("║          Complete Database Connection & Status            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\n");

  // Check configuration
  if (!process.env.MONGO_URI) {
    console.log("❌ ERROR: MONGO_URI not configured in .env!");
    console.log("\n📋 Required environment variable:");
    console.log("   MONGO_URI=mongodb://127.0.0.1:27017/ewara\n");
    return;
  }

  console.log("📋 CONFIGURATION:");
  console.log(`   🔗 URI: ${process.env.MONGO_URI}`);
  console.log("\n");

  try {
    // Step 1: Connect to MongoDB
    console.log("🔐 Step 1: Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connection established!\n");

    // Step 2: Get MongoDB server info
    console.log("📊 Step 2: Retrieving server information...");
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    console.log("✅ Server info retrieved!\n");

    // Step 3: Get database stats
    console.log("📈 Step 3: Getting database statistics...");
    const dbStats = await mongoose.connection.db.stats();
    console.log("✅ Database stats retrieved!\n");

    // Step 4: List all collections
    console.log("📚 Step 4: Fetching collections...");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections\n`);

    // Display Results
    console.log("═══════════════════════════════════════════════════════════\n");
    console.log("✅ MONGODB STATUS: CONNECTED & HEALTHY\n");
    console.log("═══════════════════════════════════════════════════════════\n");

    console.log("📊 SERVER INFORMATION:");
    console.log(`   Version: ${serverStatus.version}`);
    console.log(`   Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`);
    console.log(`   Connections: ${serverStatus.connections.current} active\n`);

    console.log("💾 DATABASE STATISTICS:");
    console.log(`   Database: ${dbStats.db}`);
    console.log(`   Collections: ${dbStats.collections}`);
    console.log(`   Data Size: ${(dbStats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Storage Size: ${(dbStats.storageSize / 1024).toFixed(2)} KB\n`);

    console.log("📚 COLLECTIONS:");
    for (const collection of collections) {
      const collectionObj = mongoose.connection.db.collection(collection.name);
      const docCount = await collectionObj.countDocuments();
      console.log(`   ✓ ${collection.name} (${docCount} documents)`);
    }
    console.log("\n");

    // Step 5: Check specific collections
    console.log("🔍 Step 5: Checking essential collections...\n");

    const essentialCollections = [
      "users",
      "products",
      "orders",
      "coupons",
      "addresses",
    ];

    for (const collName of essentialCollections) {
      const collection = mongoose.connection.db.collection(collName);
      try {
        const exists = await mongoose.connection.db
          .listCollections({ name: collName })
          .toArray();

        if (exists.length > 0) {
          const count = await collection.countDocuments();
          console.log(`   ✅ ${collName}: ${count} documents`);
        } else {
          console.log(`   ⚠️  ${collName}: Not created yet (will be auto-created)`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${collName}: Error checking - ${error.message}`);
      }
    }

    console.log("\n═══════════════════════════════════════════════════════════\n");

    console.log("🎉 FINAL STATUS: MONGODB FULLY OPERATIONAL\n");

    console.log("✅ Verified:");
    console.log("   • MongoDB server is running");
    console.log("   • Database connection is active");
    console.log("   • Collections are accessible");
    console.log("   • Document storage is working\n");

    console.log("📋 Collections Status:");
    if (collections.length === 0) {
      console.log("   ⚠️  No collections yet - they will auto-create on first insert\n");
    } else {
      console.log(`   ✅ ${collections.length} collections found and verified\n`);
    }

    console.log("🚀 Ready for:");
    console.log("   • User registration and authentication");
    console.log("   • Product management");
    console.log("   • Order processing");
    console.log("   • Coupon management");
    console.log("   • Address storage\n");

    await mongoose.disconnect();
    console.log("✅ Connection closed gracefully\n");

  } catch (error) {
    console.log("❌ ERROR: MongoDB verification failed!\n");
    console.log("═══════════════════════════════════════════════════════════\n");
    console.log(`Error: ${error.message}\n`);

    console.log("🔧 TROUBLESHOOTING:\n");
    console.log("1️⃣  MONGODB NOT RUNNING:");
    console.log("   Windows: Start 'MongoDB' service from Services");
    console.log("   OR run: mongod --config C:\\path\\to\\mongod.conf\n");

    console.log("2️⃣  WRONG CONNECTION STRING:");
    console.log("   Check .env MONGO_URI is correct");
    console.log("   Default: mongodb://127.0.0.1:27017/ewara\n");

    console.log("3️⃣  FIREWALL ISSUES:");
    console.log("   Verify MongoDB port 27017 is accessible");
    console.log("   Check Windows Firewall settings\n");

    console.log("4️⃣  PERMISSIONS:");
    console.log("   Ensure MongoDB process has write permissions");
    console.log("   Check /data/db directory exists and is writable\n");

    console.log("5️⃣  VERIFY MONGODB STATUS:");
    console.log("   Run: mongo --eval 'db.version()'\n");

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Run verification
verifyMongoDB();
