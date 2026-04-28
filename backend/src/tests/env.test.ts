import assert from "node:assert/strict";
import { validateEnv } from "../config/env";

const ORIGINAL_ENV = { ...process.env };

export const runEnvTests = async () => {
  process.env = { ...ORIGINAL_ENV };
  process.env.MONGO_URI = "mongodb://localhost:27017/test";
  process.env.JWT_SECRET = "secret";

  assert.doesNotThrow(() => validateEnv());

  process.env = { ...ORIGINAL_ENV };
  delete process.env.MONGO_URI;
  delete process.env.JWT_SECRET;

  assert.throws(() => validateEnv(), /Missing required environment variables/);

  process.env = { ...ORIGINAL_ENV };
};
