# Admin Reference

This file is a safe developer reference for operational access and configuration.
It intentionally does not duplicate live passwords, API secrets, tokens, or private keys.

## Primary Config Files

- Frontend env: [`.env.local`](C:/Ewara%20codes/.env.local)
- Frontend sample env: [`.env.example`](C:/Ewara%20codes/.env.example)
- Frontend production sample env: [`.env.production.example`](C:/Ewara%20codes/.env.production.example)
- Backend env: [`backend/.env`](C:/Ewara%20codes/backend/.env)
- Backend sample env: [`backend/.env.example`](C:/Ewara%20codes/backend/.env.example)

## Database

- Runtime config file: [`backend/src/config/db.ts`](C:/Ewara%20codes/backend/src/config/db.ts)
- Dialect: `MySQL`
- Default schema used by the app: `ewara`
- Expected env keys:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`

### Access Notes

- MySQL Workbench connection name can be `Ewara`
- Common local host: `localhost`
- Common local port: `3306`
- Main data models live in [`backend/src/models`](C:/Ewara%20codes/backend/src/models)

## Auth And Session

- JWT secret key name: `JWT_SECRET`
- JWT usage:
  - [`backend/src/controllers/auth.controller.ts`](C:/Ewara%20codes/backend/src/controllers/auth.controller.ts)
  - [`backend/src/middleware/auth.ts`](C:/Ewara%20codes/backend/src/middleware/auth.ts)
- Env validation file:
  - [`backend/src/config/env.ts`](C:/Ewara%20codes/backend/src/config/env.ts)

## Email

- Required env keys:
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `EMAIL_FROM`
  - `SUPPORT_EMAIL`
- Main email utilities:
  - [`backend/src/utils/sendEmail.ts`](C:/Ewara%20codes/backend/src/utils/sendEmail.ts)
  - [`backend/src/utils/emailService.ts`](C:/Ewara%20codes/backend/src/utils/emailService.ts)
- Test route and helper:
  - [`backend/src/routes/emailTest.ts`](C:/Ewara%20codes/backend/src/routes/emailTest.ts)
  - [`backend/test-email-delivery.js`](C:/Ewara%20codes/backend/test-email-delivery.js)

## Payments

- Frontend/public Razorpay key env:
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- Server-side Razorpay secret env:
  - `RAZORPAY_KEY_SECRET`
- Checkout route:
  - [`app/api/checkout/razorpay/route.ts`](C:/Ewara%20codes/app/api/checkout/razorpay/route.ts)
- Webhook route:
  - [`app/api/webhooks/razorpay/route.ts`](C:/Ewara%20codes/app/api/webhooks/razorpay/route.ts)

### Local Development Rule

- On localhost, use Razorpay test keys that start with `rzp_test_`
- Do not use live Razorpay keys in local development

## Frontend Runtime

- API base URL env: `NEXT_PUBLIC_API_URL`
- App URL env: `NEXT_PUBLIC_APP_URL`
- Google login env: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Frontend API helpers:
  - [`utils/api.ts`](C:/Ewara%20codes/utils/api.ts)
  - [`lib/api.ts`](C:/Ewara%20codes/lib/api.ts)

## Backend Runtime

- Server entry:
  - [`backend/src/server.ts`](C:/Ewara%20codes/backend/src/server.ts)
- Important env keys:
  - `PORT`
  - `NODE_ENV`
  - `FRONTEND_URL`
  - `CORS_ORIGINS`
  - `BUSINESS_NAME`
  - `BUSINESS_NAME`
  - `BUSINESS_EMAIL` via `EMAIL_FROM`

## Legacy Or Mixed Database Scripts

The main app runtime is MySQL-based, but some older scripts still reference MongoDB-style env keys.

- Examples:
  - [`backend/scripts/seed-test-orders.js`](C:/Ewara%20codes/backend/scripts/seed-test-orders.js)
  - [`backend/scripts/test-admin-api.ts`](C:/Ewara%20codes/backend/scripts/test-admin-api.ts)
  - [`backend/scripts/verify-dashboard-metrics.ts`](C:/Ewara%20codes/backend/scripts/verify-dashboard-metrics.ts)
  - [`backend/scripts/backfill-order-payment-status.js`](C:/Ewara%20codes/backend/scripts/backfill-order-payment-status.js)

If you want a single-database setup, these should be reviewed and migrated or removed.

## Suggested Operational Checklist

- Keep live secrets only in env files or your deployment secret manager
- Do not duplicate secrets into markdown or docs
- Rotate any secret that has already been committed to the repo
- Prefer placeholders in docs and examples
- Restart frontend/backend after env changes

## Where To Look First

- App config overview: [`README.md`](C:/Ewara%20codes/README.md)
- Full project docs: [`docs/PROJECT_DOCUMENTATION.md`](C:/Ewara%20codes/docs/PROJECT_DOCUMENTATION.md)
- Backend env validation: [`backend/src/config/env.ts`](C:/Ewara%20codes/backend/src/config/env.ts)
