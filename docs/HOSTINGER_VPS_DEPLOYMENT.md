# Hostinger VPS Deployment

This project can run on a single Hostinger VPS with two Node.js processes:

- Frontend: Next.js on port `3000`
- Backend: Express API on port `5000`

## Recommended Hostinger VPS Setup

Hostinger documents that Node.js apps on VPS have full root access and that the pre-made Ubuntu 22.04 64-bit with Node.js and OpenLiteSpeed template is the recommended VPS setup for Node.js workloads. Hostinger also recommends using the VPS browser terminal or SSH for management.

## 1. Prepare the VPS

1. Buy or open your Hostinger VPS.
2. Select the Ubuntu 22.04 64-bit with Node.js and OpenLiteSpeed template if you are still choosing the server image.
3. Open the VPS browser terminal from hPanel or connect via SSH.
4. Install basic tools if needed:
   - `git`
   - `pm2`
   - `mysql-server` if you want MySQL on the same VPS

## 2. Clone the project

```bash
git clone <your-repo-url>
cd <repo-folder>
```

## 3. Set environment variables

### Frontend root `.env` or `.env.local`

```env
NEXT_PUBLIC_API_URL=https://api.ewaraofficial.com
NEXT_PUBLIC_APP_URL=https://www.ewaraofficial.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=345425970600-1q7aaec0t01ol3gq45gfhfjucmjugjvd.apps.googleusercontent.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_PHONE_OTP_ENABLED=false
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

`RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are server-side values. They are safe in the VPS root `.env` because only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Backend `backend/.env`

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=ewarauser
DB_PASSWORD=your_mysql_password
DB_NAME=ewara
JWT_SECRET=your_long_secret
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
NEXT_PUBLIC_APP_URL=https://www.ewaraofficial.com
FRONTEND_URL=https://www.ewaraofficial.com
CORS_ORIGINS=https://ewaraofficial.com,https://www.ewaraofficial.com,https://api.ewaraofficial.com
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
PHONE_OTP_ENABLED=false
NODE_ENV=production
```

Use the same Razorpay key secret in both root `.env` and `backend/.env`; the Next.js API route creates the Razorpay order and the backend verifies the successful payment signature before creating the order.
Prefer Resend for production emails. Keep Titan SMTP values as fallback.

## 4. Install and build

```bash
npm install
cd backend
npm install
cd ..
npm run build
cd backend
npm run build
cd ..
```

## 5. Start with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 6. Reverse proxy

Put a reverse proxy in front of the two ports:

- Frontend -> `127.0.0.1:3000`
- Backend -> `127.0.0.1:5000`

Production mapping:

- `ewaraofficial.com` -> frontend
- `www.ewaraofficial.com` -> frontend
- `api.ewaraofficial.com` -> backend

If you prefer a single domain, proxy `/api` to the backend and everything else to the frontend.

## 7. SSL and DNS

1. Point your domain DNS records to the VPS IP.
2. Enable SSL for both frontend and API endpoints.
3. Update CORS and `NEXT_PUBLIC_API_URL` after the final domain is live.

## 8. Redeploy after changes

After code or env changes:

```bash
cd <repo-folder>
git pull
npm install
npm run build
cd backend
npm install
npm run build
cd ..
pm2 restart ecosystem.config.cjs --update-env
```

## 9. Product image uploads

The admin product add/edit screens upload product images through the backend.

- Upload API: `POST /api/products/uploads/images`
- Storage directory: `/var/www/ewara/public/uploads/products`
- Product image path format: `/uploads/products/<filename>`

Make sure the uploads directory is backed up because it is runtime data and is not committed to Git.

## 10. Backups and health checks

Manual backup:

```bash
cd /var/www/ewara
bash scripts/vps-backup.sh
```

Health check:

```bash
cd /var/www/ewara
bash scripts/vps-health-check.sh
```

Certbot renewal dry-run:

```bash
cd /var/www/ewara
RUN_CERTBOT_DRY_RUN=1 bash scripts/vps-health-check.sh
```

## Notes

- Keep SMTP and business/support email values in backend env only.
- Keep `NEXT_PUBLIC_*` values limited to browser-safe values.
- If your MySQL database is managed elsewhere, only update `DB_HOST`, `DB_USER`, and `DB_PASSWORD` to match it.
- Keep `public/uploads` in the backup routine.
