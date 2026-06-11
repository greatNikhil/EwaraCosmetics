# Ewara Cosmetics Project Documentation

## 1. Project Overview

Ewara Cosmetics is a full-stack e-commerce platform for browsing, purchasing, and managing beauty products. The project combines:

- A `Next.js 14` storefront in the repository root
- An `Express 5 + TypeScript` backend in [`backend/`](../backend)
- A `MySQL` database accessed through `Sequelize`
- `Razorpay` for online payments
- `Resend API` transactional email workflows with SMTP fallback support

The application supports a customer storefront, authenticated shopping flows, and an admin area for operational management.

## 2. Current Architecture

### Frontend

- Framework: `Next.js 14` with App Router
- Language: `TypeScript`
- UI: `React 18`, `Tailwind CSS`
- State management: `Zustand`
- HTTP client: `fetch` and `axios`
- Deployment target: Hostinger VPS behind Nginx

### Backend

- Runtime: `Node.js`
- Framework: `Express 5`
- Language: `TypeScript`
- ORM: `Sequelize`
- Database: `MySQL`
- Authentication: `JWT`
- Email: `Resend API` preferred, SMTP fallback supported
- Payments: `Razorpay`

### Data / Infra Notes

- The backend auto-syncs Sequelize models at startup with `sequelize.sync({ alter: true })`.
- Product images are served from the frontend `public/` directory, including runtime uploads under `public/uploads`.
- The checkout flow mixes frontend API routes and backend APIs:
  - Next.js route handlers create Razorpay orders and handle payment callbacks/webhooks
  - Express creates finalized orders and manages stock, coupons, and notifications

## 3. Repository Structure

```text
Ewara codes/
|-- app/                     # Next.js App Router pages and route handlers
|-- components/              # Shared UI components
|-- hooks/                   # Client-side hooks
|-- lib/                     # Shared frontend helpers
|-- store/                   # Zustand stores
|-- utils/                   # Frontend utility and API wrapper modules
|-- public/                  # Static assets and product images
|-- backend/                 # Express API, models, controllers, scripts, tests
|-- docs/                    # Long-form documentation
|-- scripts/                 # Frontend/root automation scripts
|-- README.md                # Quick-start entry doc
```

## 4. User-Facing Features

### Storefront

- Homepage with hero, category slider, products, newsletter, stats, and footer
- Shop page and product detail pages
- Category browsing:
  - `/category`
  - `/category/skincare`
  - `/category/hair`
  - `/category/fragrance`
- New arrivals and offers pages
- About, help, privacy, and terms pages

### Customer Account

- Email/password registration with OTP verification
- Login with email/password
- Google login
- Forgot-password OTP reset flow
- Profile management
- Address management for checkout
- Order history and order detail pages

### Shopping Flows

- Cart with persisted client state
- Wishlist with backend persistence
- Coupon validation
- Checkout modal with:
  - address selection
  - COD support
  - Razorpay online payments
  - GST and shipping calculation
- Order success page

### Admin Area

- Admin dashboard
- Product management
- Order management
- Coupon management
- Offer management
- User management
- Review moderation

## 5. Frontend Application Design

### Global Layout

The root layout in [`app/layout.tsx`](../app/layout.tsx) applies:

- global styles from `app/globals.css`
- local brand font from `public/fonts/ewara.otf`
- Google Identity Services script
- shared shell components:
  - `Navbar`
  - `StatsSection`
  - `Newsletter`
  - `Footer`
  - `AuthBootstrap`

This means most pages render inside a common storefront shell automatically.

### Main Routes

Customer routes currently present in `app/`:

- `/`
- `/about`
- `/cart`
- `/checkout/razorpay-return`
- `/forgot-password`
- `/help`
- `/login`
- `/new-arrivals`
- `/offers`
- `/orders`
- `/orders/[id]`
- `/order-success/[id]`
- `/product`
- `/product/[id]`
- `/profile`
- `/register`
- `/services`
- `/shop`
- `/wishlist`
- `/policies/privacy`
- `/policies/terms&condtions`

Admin routes:

- `/admin`
- `/admin/products`
- `/admin/products/add`
- `/admin/products/edit/[id]`
- `/admin/orders`
- `/admin/users`
- `/admin/coupons`
- `/admin/offers`
- `/admin/reviews`

### State Management

#### Auth Store

[`store/authStore.ts`](../store/authStore.ts) stores:

- `user`
- `token`
- `addresses`

Important detail:

- persistence only keeps the `token`
- user profile data is rehydrated separately
- logout clears user, token, and address state

#### Cart Store

[`store/cartStore.ts`](../store/cartStore.ts) stores cart items locally and persists them with Zustand middleware.

It also includes backend synchronization helpers:

- `syncFromBackend(token)`
- `syncToBackend(token)`

This allows guest/local cart continuity while still supporting authenticated server-side cart storage.

### Frontend API Utilities

- [`utils/api.ts`](../utils/api.ts): builds API URLs from `NEXT_PUBLIC_API_URL`
- [`lib/api.ts`](../lib/api.ts): axios instance with auth header injection and 401 redirect behavior

### Authentication Bootstrap

The app uses `AuthBootstrap` in the global layout, plus supporting hooks such as:

- [`hooks/useProtectedRoute.ts`](../hooks/useProtectedRoute.ts)
- [`hooks/useOrders.ts`](../hooks/useOrders.ts)

Note:

- [`hooks/useAuth.ts`](../hooks/useAuth.ts) is currently a placeholder returning `{ user: null, loading: false }`

## 6. Checkout and Payment Flow

Checkout is centered around [`components/CheckoutModal.tsx`](../components/CheckoutModal.tsx).

### Supported Payment Modes

- Cash on Delivery
- Razorpay online checkout
- Method-focused Razorpay entry points:
  - card
  - UPI
  - wallet
  - netbanking
  - EMI
  - pay later

### Pricing Logic

Client-side checkout currently calculates:

- `subtotal`
- coupon discount
- `GST = 18%`
- `shipping = Rs. 50` for COD, otherwise `0`
- `total = subtotal - discount + gst + shipping`

The backend recalculates these amounts again during order creation and rejects mismatches, which is the correct source of truth.

### Razorpay Flow

1. Checkout modal normalizes cart items and shipping address.
2. Frontend calls Next.js route [`app/api/checkout/razorpay/route.ts`](../app/api/checkout/razorpay/route.ts).
3. That route validates Razorpay config and creates a Razorpay order.
4. Pending order details are temporarily stored in `sessionStorage`.
5. Razorpay redirects to [`app/api/checkout/razorpay/callback/route.ts`](../app/api/checkout/razorpay/callback/route.ts).
6. Callback redirects the user to `/checkout/razorpay-return`.
7. [`app/checkout/razorpay-return/page.tsx`](../app/checkout/razorpay-return/page.tsx) verifies browser session data and calls backend `POST /api/orders`.
8. Express verifies Razorpay signature, revalidates totals and stock, creates the order, clears cart client-side, and redirects to `/order-success/[id]`.

### Payment Webhooks

[`app/api/webhooks/razorpay/route.ts`](../app/api/webhooks/razorpay/route.ts) verifies webhook signatures and logs events such as:

- `payment.authorized`
- `payment.failed`
- `payment.captured`
- `order.paid`
- `payment.method.issued`

At the moment, this route mainly logs events rather than mutating order state in the database.

## 7. Backend Design

### Server Bootstrap

[`backend/src/server.ts`](../backend/src/server.ts) is responsible for:

- loading environment variables
- validating env configuration
- connecting to MySQL
- applying CORS rules
- applying security headers
- parsing JSON/urlencoded request bodies
- mounting route groups
- registering `404` and error handlers

### CORS and Security

The backend:

- normalizes allowed origins from env values
- supports comma-separated origin lists
- expands host-only values into `http` and `https`
- sets:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security` in production

### Environment Validation

Required env vars checked in [`backend/src/config/env.ts`](../backend/src/config/env.ts):

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_NAME`
- `JWT_SECRET`

Recommended vars:

- `EMAIL_USER`
- `EMAIL_PASS`
- `NEXT_PUBLIC_APP_URL`
- `RAZORPAY_KEY_SECRET`

## 8. Backend API Surface

### Auth Routes: `/api/auth`

Defined in [`backend/src/routes/auth.routes.ts`](../backend/src/routes/auth.routes.ts).

- `POST /send-otp`
- `POST /register`
- `POST /login`
- `POST /google`
- `GET /me`
- `PUT /profile`
- `POST /forgot-password/send-otp`
- `POST /reset-password`

Key behaviors:

- OTP send/reset endpoints are rate-limited
- login and Google login are rate-limited
- JWT includes `id` and `role`
- blocked or soft-deleted users are denied access

### Product Routes: `/api/products`

Defined in [`backend/src/routes/product.routes.ts`](../backend/src/routes/product.routes.ts).

- `GET /`
- `GET /:id`
- `GET /:id/reviews`
- `POST /:id/reviews`
- `POST /` admin only
- `PUT /:id` admin only
- `DELETE /:id` admin only

### Order Routes: `/api/orders`

Defined in [`backend/src/routes/order.routes.ts`](../backend/src/routes/order.routes.ts).

- `POST /`
- `POST /payment-failure`
- `GET /my`
- `GET /`
- `GET /:id`
- `PUT /:id/status`
- `PUT /:id/payment-status`

Key behaviors:

- order creation is transactional
- stock is decremented during successful order creation
- stock is restored when an order is moved to `Cancelled` for the first time
- payment signatures are verified when Razorpay fields are present

### Admin Routes: `/api/admin`

Defined in [`backend/src/routes/admin.routes.ts`](../backend/src/routes/admin.routes.ts).

- `GET /dashboard`
- `GET /users`
- `GET /reviews`
- `PUT /users/:id/role`
- `PATCH /users/:id/block`
- `DELETE /users/:id`
- `DELETE /reviews/:id`

### Coupon Routes: `/api/coupons`

- `POST /validate`
- `GET /`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

Notes:

- coupon validation is rate-limited
- admin CRUD is protected with auth + admin middleware

### Offer Routes: `/api/offers`

- `GET /`
- `GET /admin`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

### Address Routes: `/api/addresses`

Address route group exists in the server and is used by checkout/profile flows. It manages saved user addresses for authenticated customers.

### Wishlist Routes: `/api/wishlist`

- get wishlist
- add product
- remove by item ID
- remove by product ID
- check membership
- clear wishlist

### Cart Routes: `/api/cart`

- get cart
- add item
- update quantity
- remove item
- remove by product ID
- clear cart

### Newsletter Routes: `/api/newsletter`

- `POST /subscribe`

This stores or reactivates subscriber records.

### Promo / Email Test Routes

The backend also mounts:

- `/api/promo`
- `/api/email-test`

These are used for promotional email workflows and email testing support.

## 9. Data Model Summary

### User

Main fields from [`backend/src/models/user.ts`](../backend/src/models/user.ts):

- `id`
- `name`
- `lastname`
- `email`
- `phone`
- `password`
- `googleId`
- `avatar`
- `role`
- `isBlocked`
- `isDeleted`

### Product

Main fields from [`backend/src/models/Product.ts`](../backend/src/models/Product.ts):

- `id`
- `name`
- `slug`
- `description`
- `shortDescription`
- `brand`
- `category`
- `price`
- `originalPrice`
- `discountPercent`
- `countInStock`
- `images`
- `isFeatured`
- `isPublished`
- `showInNewArrivals`
- `rating`
- `numReviews`

### Order

Main fields from [`backend/src/models/order.model.ts`](../backend/src/models/order.model.ts):

- `id`
- `user`
- `items`
- `subtotalAmount`
- `couponCode`
- `discountAmount`
- `gstAmount`
- `shippingAmount`
- `totalAmount`
- `paymentMethod`
- `paymentStatus`
- `status`
- `shippingAddress`
- `razorpayPaymentId`
- `razorpayOrderId`
- `stockRestored`

### Additional Models

The backend also includes models for:

- addresses
- cart items
- wishlist items
- coupons
- offers
- reviews
- newsletter subscribers
- OTP records

## 10. Emails and Notifications

The email layer is implemented in [`backend/src/utils/emailService.ts`](../backend/src/utils/emailService.ts).

Supported email categories:

- welcome email
- order confirmation email
- payment success email with PDF invoice attachment
- payment failed email
- order shipped email
- order delivered email
- password reset email
- password reset success email
- promotional email

Invoice generation is handled by [`backend/src/utils/invoice.ts`](../backend/src/utils/invoice.ts).

## 11. Product Data Import and Operations

The backend includes operational scripts in [`backend/scripts/`](../backend/scripts).

Important examples:

- `import-products-from-csv.js`
- `verify-data-integrity.js`
- `verify-dashboard-metrics.ts`
- `create-admin-user.ts`
- `seed-test-orders.ts`
- `fix-test-user-password.ts`
- `backfill-order-payment-status.js`

### CSV Product Import

[`backend/scripts/import-products-from-csv.js`](../backend/scripts/import-products-from-csv.js):

- reads a CSV file
- normalizes product data
- validates required fields
- validates image path mappings under `public/`
- supports upsert-style import
- can be used in validation-only mode

## 12. Setup Instructions

### Frontend Setup

From repository root:

```bash
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:3000
```

### Backend Setup

From `backend/`:

```bash
npm install
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### Frontend Environment Variables

Root `.env.local` should provide values like:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
NEXT_PUBLIC_PHONE_OTP_ENABLED=false
```

Examples exist in:

- [`.env.example`](../.env.example)
- [`.env.production.example`](../.env.production.example)

### Backend Environment Variables

The backend expects a separate `backend/.env`.

Minimum practical setup:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=ewara
JWT_SECRET=replace_with_a_long_random_secret
SMTP_HOST=smtp.titan.email
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=info@ewaraofficial.com
EMAIL_PASS=your_smtp_password
EMAIL_FROM=info@ewaraofficial.com
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=Ewara Cosmetics <info@ewaraofficial.com>
BUSINESS_NAME=Ewara Cosmetics
NEXT_PUBLIC_APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
PHONE_OTP_ENABLED=false
NODE_ENV=development
```

## 13. Available Scripts

### Root / Frontend

Defined in [`package.json`](../package.json):

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run type-check`
- `npm run test`
- `npm run test:ui`
- `npm run audit:deploy`
- `npm run test:phase9`

### Backend

Defined in [`backend/package.json`](../backend/package.json):

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run test`
- `npm run test:integrity`
- `npm run test:phase8`
- `npm run backfill:payment-status`
- `npm run import:products:csv`

## 14. Testing

### Frontend

Frontend testing is configured with `Vitest` and `jsdom`.

Files of interest:

- [`vitest.config.ts`](../vitest.config.ts)

### Backend

Backend tests exist under [`backend/src/tests/`](../backend/src/tests) and cover areas such as:

- auth controller
- address controller
- admin controller
- coupon logic and controller
- order controller
- promo controller
- rate limiting
- review controller
- validation
- environment checks

## 15. Deployment Notes

### Frontend

- The production frontend runs on the Hostinger VPS through PM2 and Nginx.
- Frontend route handlers depend on Razorpay env vars being available in the root production env file.
- Public storefront domains are `https://ewaraofficial.com` and `https://www.ewaraofficial.com`.

### Backend

- The production backend runs on the same Hostinger VPS through PM2 and Nginx.
- API domain is `https://api.ewaraofficial.com`.
- Backend must be configured with production MySQL credentials.
- CORS allowlist must include `https://ewaraofficial.com`, `https://www.ewaraofficial.com`, and `https://api.ewaraofficial.com`.

## 16. Important Implementation Notes

- The codebase source of truth is now `MySQL + Sequelize`, not MongoDB.
- Some legacy markdown files in the repository still mention MongoDB or older implementation states.
- `README.md` and this document should be treated as the primary starting point.
- `sequelize.sync({ alter: true })` is convenient in development, but many teams replace this with migrations before production hardening.
- Razorpay webhooks are currently validated and logged, but not yet deeply connected to backend order-state reconciliation.

## 17. Recommended Reading Order

For onboarding a new developer:

1. Read [`README.md`](../README.md)
2. Read this file
3. Inspect [`app/layout.tsx`](../app/layout.tsx) and [`app/page.tsx`](../app/page.tsx)
4. Inspect [`components/CheckoutModal.tsx`](../components/CheckoutModal.tsx)
5. Inspect [`backend/src/server.ts`](../backend/src/server.ts)
6. Inspect [`backend/src/controllers/order.controller.ts`](../backend/src/controllers/order.controller.ts)
7. Inspect [`backend/src/models/`](../backend/src/models)

## 18. Known Documentation Gaps Resolved Here

This document intentionally corrects a few repo-level ambiguities:

- backend database is `MySQL`, not `MongoDB`
- backend ORM is `Sequelize`, not `Mongoose`
- Razorpay order creation is handled in Next.js route handlers, while final order creation happens in Express
- checkout totals are recomputed server-side, not trusted from the client
