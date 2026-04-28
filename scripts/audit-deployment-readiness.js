const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();

const scanRoots = [
  "app",
  "components",
  "hooks",
  "lib",
  "store",
  "utils",
  "backend/src",
];

const ignoredPaths = new Set([
  "utils/testCheckout.ts",
  "utils/sampleOrders.ts",
  "backend/src/tests/run-tests.ts",
]);

const findings = [];

const readText = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), "utf8");

const walk = (relativePath) => {
  if (!fs.existsSync(path.join(rootDir, relativePath))) {
    return [];
  }

  const entries = fs.readdirSync(path.join(rootDir, relativePath), {
    withFileTypes: true,
  });
  const files = [];

  for (const entry of entries) {
    const nextPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(nextPath));
      continue;
    }

    if (/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) {
      files.push(nextPath.replace(/\\/g, "/"));
    }
  }

  return files;
};

const addFinding = (severity, message) => {
  findings.push({ severity, message });
};

for (const scanRoot of scanRoots) {
  for (const file of walk(scanRoot)) {
    if (ignoredPaths.has(file) || file.includes("/tests/") || file.includes("/scripts/")) {
      continue;
    }

    const content = readText(file);
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (line.includes("console.log(")) {
        addFinding("error", `${file}:${index + 1} contains console.log`);
      }

      if (line.includes("debugger")) {
        addFinding("error", `${file}:${index + 1} contains debugger`);
      }
    });
  }
}

const gitignorePath = ".gitignore";
if (fs.existsSync(path.join(rootDir, gitignorePath))) {
  const gitignore = readText(gitignorePath);

  for (const expected of [".env", ".env.local", ".env.*.local"]) {
    if (!gitignore.includes(expected)) {
      addFinding("error", `.gitignore is missing ${expected}`);
    }
  }
}

const frontendEnvExample = ".env.example";
if (fs.existsSync(path.join(rootDir, frontendEnvExample))) {
  const frontendEnv = readText(frontendEnvExample);
  const forbiddenPublicExampleKeys = [
    "RAZORPAY_KEY_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "JWT_SECRET",
    "MONGO_URI",
    "EMAIL_PASS",
  ];

  for (const key of forbiddenPublicExampleKeys) {
    if (frontendEnv.includes(`${key}=`)) {
      addFinding(
        "error",
        `${frontendEnvExample} should not contain private key ${key}`
      );
    }
  }
}

const vercelPath = "vercel.json";
if (fs.existsSync(path.join(rootDir, vercelPath))) {
  const vercel = JSON.parse(readText(vercelPath));
  const envKeys = Object.keys(vercel.env || {});

  for (const key of envKeys) {
    if (!key.startsWith("NEXT_PUBLIC_")) {
      addFinding(
        "error",
        `${vercelPath} exposes non-public env key ${key}; keep secrets in the hosting provider secret store`
      );
    }
  }
}

const backendEnvExample = "backend/.env.example";
if (fs.existsSync(path.join(rootDir, backendEnvExample))) {
  const backendEnv = readText(backendEnvExample);
  const requiredBackendKeys = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "EMAIL_USER",
    "EMAIL_PASS",
    "RAZORPAY_KEY_SECRET",
  ];

  for (const key of requiredBackendKeys) {
    if (!backendEnv.includes(`${key}=`)) {
      addFinding("error", `${backendEnvExample} is missing ${key}`);
    }
  }
}

const report = findings.sort((a, b) => a.severity.localeCompare(b.severity));

if (report.length === 0) {
  console.log("Deployment readiness audit passed.");
  process.exit(0);
}

console.log("Deployment readiness audit found issues:");
for (const finding of report) {
  console.log(`- [${finding.severity}] ${finding.message}`);
}

process.exit(1);
