# Ewara Cosmetics Final Testing and Deployment Guide

Use this guide as the final launch checklist before delivering the project to the client.

## 1. Project Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, Axios
- Backend: Node.js, Express, TypeScript, MySQL, Sequelize, JWT, Nodemailer
- Payments: Razorpay
- Frontend deployment: Vercel or any Next.js-compatible host
- Backend deployment: Render, Railway, VPS, or any Node.js host
- Database: MySQL, not MongoDB

## 2. Required Local Setup

Open two terminals.

Frontend:

```powershell
cd "C:\Ewara codes"
npm install
npm run dev
```

Backend:

```powershell
cd "C:\Ewara codes\backend"
npm install
npm run dev
```

Expected local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 3. Required Environment Variables

Frontend root `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

Do not put private secrets in public frontend env examples. If a Next.js API route
needs `RAZORPAY_KEY_SECRET`, add it only in your hosting provider's server-side
environment variable store.

Backend `backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=ewara
JWT_SECRET=replace_with_a_long_random_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=info@ewaraofficial.com
BUSINESS_NAME=Ewara Cosmetics
NEXT_PUBLIC_APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
NODE_ENV=development
```

Production must use production domains and live/production credentials.

## 4. Automated Pre-Launch Checks

Run from project root:

```powershell
npm run audit:deploy
npm run type-check
npm run lint
npm run build
```

Expected:

- `audit:deploy` passes
- TypeScript passes
- Lint exits with no errors
- Build completes successfully

Lint warnings about `<img>` and hook dependencies are not current launch blockers, but should be logged as future improvements.

Run backend checks:

```powershell
cd "C:\Ewara codes\backend"
npm test
```

Expected:

- Backend compiles
- 11/11 tests pass

Known acceptable test output:

- Test logs may show expected negative-case errors such as invalid coupon, stock mismatch, or order total mismatch.
- `JWT_SECRET looks short` means local test secret is weak. Production must use a strong secret.

## 5. Backend API Smoke Testing

Use Postman, Thunder Client, or curl.

### Public Routes

Test:

- `GET /`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/offers`
- `GET /api/promo/templates`
- `POST /api/newsletter/subscribe`
- `POST /api/coupons/validate`

Expected:

- Public list routes return `200`
- Invalid IDs return `400`
- Missing coupon code returns `400`
- No route should return dummy data unless intentionally seeded in the database

### Auth Routes

Test:

- `POST /api/auth/send-otp`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/forgot-password/send-otp`
- `POST /api/auth/reset-password`

Expected:

- Missing body returns `400`
- Invalid login returns `400`
- Valid login returns JWT token and user object
- `/api/auth/me` without token returns `401`
- `/api/auth/me` with token returns current user
- Blocked/deleted users cannot continue

### Protected User Routes

Test without token:

- `GET /api/cart`
- `GET /api/wishlist`
- `GET /api/orders/my`
- `GET /api/addresses`

Expected:

- All return `401`

Test with user token:

- Cart add/update/delete
- Wishlist add/remove/check
- Address create/update/delete
- My orders list

Expected:

- User only sees their own data
- No admin data is exposed

### Admin Routes

Test without token:

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/orders`
- `POST /api/products`

Expected:

- All return `401`

Test with normal user token:

- Same routes should return `403`

Test with admin token:

- Dashboard loads
- Admin can list users, products, reviews, orders, coupons, offers
- Admin can create/update/delete products
- Admin can update order status
- Admin can update payment status
- Admin cannot delete/block/change role of self

## 6. Order and Stock Testing

Prepare:

- At least 3 published products
- Each product has stock greater than 3
- One test customer account
- One test admin account

COD order flow:

1. Login as customer.
2. Add product to cart.
3. Add/select address.
4. Place COD order.
5. Confirm order success page.
6. Confirm order appears in customer `/orders`.
7. Confirm order appears in admin orders.
8. Confirm `paymentStatus = Pending`.
9. Confirm stock decreased.

Cancel flow:

1. Login as admin.
2. Change order status to `Cancelled`.
3. Confirm stock is restored.
4. Confirm order status changed.

Razorpay success flow:

1. Use Razorpay test mode keys.
2. Place Razorpay order.
3. Complete test payment.
4. Confirm redirect to order success page.
5. Confirm `paymentStatus = Completed`.
6. Confirm stock decreased.
7. Confirm confirmation/payment emails if SMTP is configured.

Razorpay failure/cancel flow:

1. Open checkout with Razorpay.
2. Cancel payment or use failed test payment.
3. Confirm order is not created.
4. Confirm stock does not reduce.
5. Confirm user sees a clear error message.

## 7. Frontend Page Testing

Test these pages on desktop and mobile:

- `/`
- `/shop`
- `/product/[id]`
- `/category`
- `/category/skincare`
- `/category/hair`
- `/category/fragrance`
- `/cart`
- `/wishlist`
- `/login`
- `/register`
- `/forgot-password`
- `/profile`
- `/orders`
- `/orders/[id]`
- `/order-success/[id]`
- `/offers`
- `/services`
- `/help`
- `/admin`
- `/admin/products`
- `/admin/products/add`
- `/admin/products/edit/[id]`
- `/admin/orders`
- `/admin/coupons`
- `/admin/offers`
- `/admin/users`
- `/admin/reviews`

Check:

- Page loads without crash
- No hydration errors
- No console errors
- No broken images
- No broken links
- Loading states appear when data is loading
- Empty states are readable
- Forms show validation errors
- Buttons are clickable
- Mobile layout has no horizontal scroll
- Admin pages are not usable by non-admin users

## 8. Auth and Session Testing

Customer session:

1. Login.
2. Refresh page.
3. Confirm user remains logged in.
4. Visit `/profile`.
5. Visit `/orders`.
6. Logout.
7. Confirm token/user data is cleared.
8. Try `/profile` again.
9. Confirm redirect to login.

Admin session:

1. Login as admin.
2. Visit `/admin`.
3. Refresh page.
4. Confirm admin dashboard still loads.
5. Logout.
6. Confirm admin access is removed.

Security check:

- Normal user should not access admin API.
- Normal user should not access admin UI data.
- Missing token should return `401`.
- Non-admin token should return `403`.

## 9. CORS and API URL Testing

Local:

- Frontend calls `http://localhost:5000`
- Backend allows `http://localhost:3000`

Production:

- `NEXT_PUBLIC_API_URL` must be the backend production URL.
- Backend `CORS_ORIGINS` must include the frontend production URL.
- No production frontend should call localhost.

Test:

- Open deployed frontend.
- Login.
- Browse products.
- Add to cart.
- Place test order.
- Check browser Network tab.

Expected:

- API requests go to production backend.
- No CORS errors.
- No localhost API calls.

## 10. Security Review Checklist

Before launch, verify:

- `.env`, `.env.local`, and backend `.env` are not committed.
- `CREDENTIALS.local.md` is not committed.
- `JWT_SECRET` is long and random.
- Razorpay secret key is not public.
- Email app password is not public.
- Admin APIs require admin role.
- CORS is not wildcard in production.
- Passwords are hashed.
- OTP is not exposed in UI or logs.
- Payment signature verification is active.
- Backend does not expose stack traces to users.

## 11. Production Deployment Checklist

Frontend deployment:

- Install command: `npm install`
- Build command: `npm run build`
- Start command: handled by hosting provider for Next.js
- Output: `.next`
- Required env:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET` as a server-side hosting secret only, never exposed with `NEXT_PUBLIC_`

Backend deployment:

- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`
- Required env:
  - `PORT`
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `JWT_SECRET`
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `EMAIL_FROM`
  - `BUSINESS_NAME`
  - `NEXT_PUBLIC_APP_URL`
  - `FRONTEND_URL` or `CORS_ORIGINS`
  - `RAZORPAY_KEY_SECRET`
  - `NODE_ENV=production`

Database:

- MySQL database exists
- Tables are created/synced
- Production database is backed up
- Restore process is documented
- Admin user exists
- Test products exist or product import is completed

## 12. Final Launch Smoke Test

Run after deployment:

1. Open production frontend.
2. Confirm home page loads.
3. Confirm product list loads.
4. Register or login as customer.
5. Add address.
6. Add product to cart.
7. Place COD test order.
8. Confirm order appears in customer orders.
9. Login as admin.
10. Confirm order appears in admin.
11. Update order status.
12. Confirm customer order detail updates.
13. Test Razorpay with a small controlled test/live transaction.
14. Confirm email delivery.
15. Confirm no browser console errors.
16. Confirm no backend `500` errors.

## 13. Final Go/No-Go Criteria

Ready to launch when:

- `npm run audit:deploy` passes
- `npm run type-check` passes
- `npm run lint` has no errors
- `npm run build` passes
- `cd backend && npm test` passes
- Production env variables are set
- CORS production domain is correct
- Customer checkout works
- Admin order management works
- Payment test works
- Email delivery works
- No secrets are committed
- Client has approved final UI and content

Do not launch if:

- Build fails
- Backend tests fail
- Login fails
- Checkout fails
- Admin access is broken
- Stock does not update correctly
- Production frontend calls localhost
- CORS blocks production frontend
- Secrets are exposed
