const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const dumpPath = process.argv[2];

if (!dumpPath) {
  console.error("Usage: node scripts/restore-mysql-dump.js <dump-file.sql>");
  process.exit(1);
}

const resolvedDumpPath = path.resolve(dumpPath);

if (!fs.existsSync(resolvedDumpPath)) {
  console.error(`Dump file not found: ${resolvedDumpPath}`);
  process.exit(1);
}

const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingEnvVars = requiredEnvVars.filter(
  (name) => !process.env[name] || !String(process.env[name]).trim()
);

if (missingEnvVars.length > 0) {
  console.error(`Missing database env vars in backend/.env: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const mysqlArgs = [
  "-h",
  process.env.DB_HOST,
  "-P",
  String(process.env.DB_PORT || 3306),
  "-u",
  process.env.DB_USER,
  `-p${process.env.DB_PASSWORD}`,
  process.env.DB_NAME,
];

console.log(`Importing dump: ${resolvedDumpPath}`);
console.log(`Target database: ${process.env.DB_NAME}`);

const mysql = spawn("mysql", mysqlArgs, {
  stdio: ["pipe", "inherit", "inherit"],
});

const dumpStream = fs.createReadStream(resolvedDumpPath);
dumpStream.pipe(mysql.stdin);

dumpStream.on("error", (error) => {
  console.error(`Failed to read dump file: ${error.message}`);
  mysql.kill();
  process.exit(1);
});

mysql.on("close", (code) => {
  if (code === 0) {
    console.log("Database import completed successfully.");
    process.exit(0);
  }

  console.error(`Database import failed with exit code ${code}.`);
  process.exit(code || 1);
});
