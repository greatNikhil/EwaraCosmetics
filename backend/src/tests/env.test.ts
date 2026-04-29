import assert from "node:assert/strict";
import { validateEnv } from "../config/env";

const ORIGINAL_ENV = { ...process.env };

export const runEnvTests = async () => {
  process.env = { ...ORIGINAL_ENV };
  process.env.DB_HOST = "localhost";
  process.env.DB_PORT = "3306";
  process.env.DB_USER = "root";
  process.env.DB_NAME = "ewara_test";
  process.env.JWT_SECRET = "secret";

  assert.doesNotThrow(() => validateEnv());

  process.env = { ...ORIGINAL_ENV };
  delete process.env.DB_HOST;
  delete process.env.DB_PORT;
  delete process.env.DB_USER;
  delete process.env.DB_NAME;
  delete process.env.JWT_SECRET;

  assert.throws(() => validateEnv(), /Missing required environment variables/);

  process.env = { ...ORIGINAL_ENV };
};
