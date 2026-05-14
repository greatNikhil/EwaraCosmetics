const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_NAME",
  "JWT_SECRET",
];
const recommendedEnvVars = [
  "EMAIL_USER",
  "EMAIL_PASS",
  "NEXT_PUBLIC_APP_URL",
  "RAZORPAY_KEY_SECRET",
];

const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");

const isPrivateNetworkOrigin = (value: string) => {
  const normalized = normalizeOrigin(value);

  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
    normalized
  );
};

const expandConfiguredOrigin = (value: string): string[] => {
  const normalized = normalizeOrigin(value);
  if (!normalized) {
    return [];
  }

  if (/^https?:\/\//i.test(normalized)) {
    return [normalized];
  }

  // Accept host-only env values like "my-app.vercel.app" by expanding them
  // into concrete browser origins. This makes deployment env mistakes less fatal.
  return [`https://${normalized}`, `http://${normalized}`];
};

export const getAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.CORS_ORIGINS,
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .flatMap(expandConfiguredOrigin)
    .filter(Boolean);

  if (configuredOrigins.length > 0) {
    const defaults =
      process.env.NODE_ENV === "development"
        ? [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3002",
            "http://127.0.0.1:3003",
          ]
        : [];

    return Array.from(new Set([...configuredOrigins, ...defaults]));
  }

  // ✅ Allow common development ports for localhost
  return [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
  ];
};

export const isDevelopmentOriginAllowed = (origin: string) =>
  process.env.NODE_ENV === "development" && isPrivateNetworkOrigin(origin);

export const validateEnv = () => {
  const missingRequired = requiredEnvVars.filter(
    (name) => !process.env[name] || !String(process.env[name]).trim()
  );

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingRequired.join(", ")}`
    );
  }

  const missingRecommended = recommendedEnvVars.filter(
    (name) => !process.env[name] || !String(process.env[name]).trim()
  );

  if (missingRecommended.length > 0) {
    console.warn(
      `Recommended environment variables missing: ${missingRecommended.join(", ")}`
    );
  }

  if (String(process.env.JWT_SECRET).trim().length < 16) {
    console.warn(
      "JWT_SECRET looks short. Use a longer secret before production launch."
    );
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.length === 0) {
    console.warn(
      "No frontend origins detected for CORS. Falling back to localhost defaults."
    );
  }
};
