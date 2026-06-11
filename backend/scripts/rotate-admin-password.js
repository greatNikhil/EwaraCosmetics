const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}

const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = String(process.env.ADMIN_PASSWORD || "");

if (!adminEmail || !adminPassword) {
  console.error("Usage:");
  console.error("ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='new-password' node scripts/rotate-admin-password.js");
  process.exit(1);
}

if (adminPassword.length < 10) {
  console.error("ADMIN_PASSWORD must be at least 10 characters.");
  process.exit(1);
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [users] = await connection.execute(
      "SELECT id, email, role FROM users WHERE LOWER(email) = ? LIMIT 1",
      [adminEmail]
    );

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error(`Admin user not found for email: ${adminEmail}`);
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await connection.execute(
      "UPDATE users SET password = ?, role = 'admin', updatedAt = NOW() WHERE id = ?",
      [hashedPassword, user.id]
    );

    console.log(`Admin password rotated for ${adminEmail}.`);
    console.log("Role ensured as admin.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Failed to rotate admin password:", error.message);
  process.exit(1);
});
