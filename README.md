# Ewara Cosmetics

Custom full-stack cosmetics e-commerce website for Ewara Official.

The production stack is:

- Frontend: Next.js 14 on Hostinger VPS, served through Nginx
- Backend: Express + TypeScript API on the same VPS
- Database: MySQL + Sequelize
- Process manager: PM2
- Payments: Razorpay
- Email: Resend API preferred, SMTP fallback supported
- Uploads: product and profile images stored under `public/uploads`

## Current Production Domains

- Storefront: `https://www.ewaraofficial.com`
- API: `https://api.ewaraofficial.com`
- VPS project path: `/var/www/ewara`

## Primary Documentation

- [VPS Quick Access Guide](docs/VPS_QUICK_ACCESS_GUIDE.md)
- [Production Operations Checklist](docs/PRODUCTION_OPERATIONS_CHECKLIST.md)
- [Hostinger VPS Deployment](docs/HOSTINGER_VPS_DEPLOYMENT.md)
- [Project Documentation](docs/PROJECT_DOCUMENTATION.md)
- [Full Database Restore](docs/FULL_DATABASE_RESTORE.md)

The `markdown-docs/` folder is a legacy working archive. Do not use it as the
client handoff source of truth.

## Features

- Product listing, filters, product detail pages, cart, wishlist, profile, and orders
- Admin dashboard for products, orders, coupons, offers, users, and reviews
- Admin product image upload with manual path fallback
- Email/password auth, Google login, and email OTP flows
- Phone OTP hooks are present but should stay disabled until SMS provider credentials are live
- Razorpay checkout, callback handling, webhook support, and order confirmation emails
- MySQL-backed cart, wishlist, addresses, orders, users, products, coupons, and reviews

## Local Development

### Frontend

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

## Environment Files

Do not commit real secrets. Use the example files as templates only.

### Frontend root `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
NEXT_PUBLIC_PHONE_OTP_ENABLED=false
```

### Backend `backend/.env`

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
SUPPORT_EMAIL=support@ewaraofficial.com
BUSINESS_NAME=Ewara Cosmetics
NEXT_PUBLIC_APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
PHONE_OTP_ENABLED=false
NODE_ENV=development
```

## Production Deploy From VPS

Run this on the VPS after code is pushed:

```bash
cd /var/www/ewara
git pull origin main
npm install
npm run build
cd backend
npm install
npm run build
cd ..
pm2 restart ewara-frontend --update-env
pm2 restart ewara-backend --update-env
pm2 save
sudo nginx -t
sudo systemctl reload nginx
```

## Operational Scripts

### Backup

```bash
cd /var/www/ewara
bash scripts/vps-backup.sh
```

### Health Check

```bash
cd /var/www/ewara
bash scripts/vps-health-check.sh
RUN_CERTBOT_DRY_RUN=1 bash scripts/vps-health-check.sh
```

## Security Notes

- Keep live keys only in VPS env files or provider dashboards.
- Rotate any key that was pasted into chat, terminal history, or screenshots.
- Keep `NEXT_PUBLIC_*` values browser-safe only.
- Keep `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_PASS`, `JWT_SECRET`, and DB credentials server-side only.
- Back up MySQL and `public/uploads` daily before major edits.

## Quick Smoke Test

1. Open `https://www.ewaraofficial.com`.
2. Browse `/shop` and product detail pages.
3. Add product to bag and verify `/cart`.
4. Register/login and update profile/address.
5. Place one small Razorpay order.
6. Confirm order appears in customer orders and admin orders.
7. Update order status in admin and confirm email delivery.
8. Upload a product image from admin and verify it loads publicly.

## License

Private project for Ewara Cosmetics.
