# Ewara Cosmetics

A full-stack cosmetics e-commerce project built with a Next.js storefront and an Express + MySQL backend.

Primary documentation:

- [Comprehensive Project Documentation](docs/PROJECT_DOCUMENTATION.md)
- [API Reference](API_DOCS.md)

## Features

- Authentication with email/password, OTP registration/reset, and Google login
- Product listing, product detail page, cart, wishlist, profile, and orders
- Checkout with address selection, coupons, COD, and Razorpay flow
- Admin dashboard for products, orders, coupons, users, and reviews
- Express API with JWT auth, products, orders, addresses, coupons, and promo email routes

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Axios

### Backend
- Node.js
- Express
- MySQL + Sequelize
- JWT
- Nodemailer

### Payments in the Codebase
- Razorpay is the active checkout path in the UI

## Installation

### Frontend
```bash
cd "c:\Ewara codes"
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend
```bash
cd "c:\Ewara codes\backend"
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

## Environment Variables

### Frontend root: `.env.local`
Used by the Next.js app and its `app/api/*` route handlers.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

Do not put private secrets in public frontend env examples. If a Next.js API route
needs `RAZORPAY_KEY_SECRET`, add it only in your hosting provider's server-side
environment variable store.

### Backend: `backend/.env`
Used by the Express server.

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

## Important Notes

- `NEXT_PUBLIC_API_URL` should point to your live backend API in production
- `NEXT_PUBLIC_APP_URL` should match your frontend origin exactly
- Backend `CORS_ORIGINS` should include your deployed frontend origin
- Root `.env.local` and `backend/.env` are separate and both are required

## Payment Keys

### Razorpay
Required for the current checkout flow:
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Google Login
Required if Google login is enabled:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Deployment Notes

### Frontend
- The Next.js app is configured for Vercel via [vercel.json](vercel.json)
- Vercel env vars should include:
  - `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET` as a server-side hosting secret only, never exposed with `NEXT_PUBLIC_`

### Backend
- Deploy the Express app separately
- Required backend env vars:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `JWT_SECRET`
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `NEXT_PUBLIC_APP_URL`
  - `FRONTEND_URL` or `CORS_ORIGINS`
  - `RAZORPAY_KEY_SECRET`

## Available Scripts

### Frontend
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
npm run format
npm run type-check
npm run test
npm run test:ui
```

### Backend
```bash
npm run dev
npm run build
npm run start
npm run test
```

## Quick Smoke Test

1. Register at `/register`
2. Login at `/login`
3. Browse products at `/shop`
4. Open a product detail page
5. Add products to cart
6. Open checkout and place a COD or Razorpay order
7. Confirm the order appears in `/orders`
8. Confirm admin pages load with an admin account

## Security Notes

- JWT authentication is implemented
- Backend CORS now supports an allowlist configuration
- Basic security response headers are enabled on the backend
- Sensitive auth routes use rate limiting
- Admin APIs are protected on the backend

## Troubleshooting

### CORS or Login Issues
- check `NEXT_PUBLIC_APP_URL`
- check backend `CORS_ORIGINS`
- check `NEXT_PUBLIC_API_URL`

### Database Connection Issues
- verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`
- ensure MySQL is running and reachable from the backend

### Payment Key Issues
- verify the correct Razorpay keys are set in the correct env file
- restart the app after changing env files

## API Documentation

See [API_DOCS.md](API_DOCS.md) for the backend API reference.

## License

Private project for Ewara Cosmetics.
