# Production Operations Checklist

This is the final production runbook for Ewara Official on Hostinger VPS.

## 1. Product Image Upload Workflow

Current setup:

- Admin can upload product images from product add/edit pages.
- Backend endpoint: `POST /api/products/uploads/images`
- Images are stored in `public/uploads/products`.
- Product records store relative image paths like `/uploads/products/product-name-123.webp`.
- Manual image paths still work for older products.

Recommended later CDN upgrade:

- Keep current relative URL format for now.
- When moving to CDN, replace upload storage with S3/Cloudinary/R2 and return CDN URLs from the same upload endpoint.
- Existing database image paths can stay as-is until migrated.

## 2. Daily Backup Setup

Run one manual backup first:

```bash
cd /var/www/ewara
bash scripts/vps-backup.sh
```

Default output:

- Database backups: `/var/backups/ewara/db/*.sql.gz`
- Upload backups: `/var/backups/ewara/uploads/*.tar.gz`
- Retention: 14 days

Add daily cron:

```bash
crontab -e
```

Add this line:

```cron
15 2 * * * cd /var/www/ewara && bash scripts/vps-backup.sh >> /var/log/ewara-backup.log 2>&1
```

Check backup logs:

```bash
tail -n 100 /var/log/ewara-backup.log
ls -lh /var/backups/ewara/db
ls -lh /var/backups/ewara/uploads
```

## 3. Restore Backup

Restore database:

```bash
gunzip -c /var/backups/ewara/db/ewara-YYYYMMDD-HHMMSS.sql.gz | mysql -u ewarauser -p ewara
```

Restore uploaded files:

```bash
cd /var/www/ewara/public
tar -xzf /var/backups/ewara/uploads/uploads-YYYYMMDD-HHMMSS.tar.gz
```

Restart apps after restore:

```bash
pm2 restart ewara-frontend --update-env
pm2 restart ewara-backend --update-env
pm2 save
```

## 4. Secret Rotation Checklist

Rotate these before final handoff or whenever they were exposed in chat, screenshots, terminal history, or shared notes:

- Admin password
- `JWT_SECRET`
- MySQL `ewarauser` password
- Razorpay live key secret
- Razorpay webhook secret
- Resend API key
- Titan SMTP password
- Google OAuth client secret if created
- Gupshup credentials when SMS goes live

After updating any secret:

```bash
cd /var/www/ewara
npm run build
cd backend
npm run build
cd ..
pm2 restart ewara-frontend --update-env
pm2 restart ewara-backend --update-env
pm2 save
```

Rotate admin password from the VPS:

```bash
cd /var/www/ewara/backend
ADMIN_EMAIL='admin@example.com' ADMIN_PASSWORD='new-strong-password' npm run rotate:admin-password
pm2 restart ewara-backend --update-env
pm2 save
```

Generate a fresh JWT secret:

```bash
openssl rand -base64 48
```

Never store real secrets in markdown files, screenshots, Git commits, or public issue threads.

## 5. Certbot Renewal Test

Run dry-run renewal:

```bash
sudo certbot renew --dry-run
```

Or through the health script:

```bash
cd /var/www/ewara
RUN_CERTBOT_DRY_RUN=1 bash scripts/vps-health-check.sh
```

Check timer:

```bash
systemctl list-timers | grep certbot
sudo certbot certificates
```

## 6. PM2 and Nginx Reboot Survival Test

Before reboot:

```bash
cd /var/www/ewara
pm2 save
sudo nginx -t
bash scripts/vps-health-check.sh
```

Reboot:

```bash
sudo reboot
```

After 1-2 minutes, reconnect:

```bash
ssh root@187.127.178.220
cd /var/www/ewara
pm2 list
sudo systemctl status nginx --no-pager
bash scripts/vps-health-check.sh
```

Expected:

- `ewara-frontend` online
- `ewara-backend` online
- Nginx active
- MySQL active
- `https://www.ewaraofficial.com` returns HTTP 200
- `https://api.ewaraofficial.com` returns HTTP 200

## 7. Final Delivery Smoke Test

Run these before client delivery:

```bash
cd /var/www/ewara
bash scripts/vps-health-check.sh
```

Manual browser checks:

- Home page opens on desktop and phone.
- Shop products load.
- Product detail image slider works on phone.
- Add to bag works from shop and product detail.
- Cart empties after successful order.
- Login/register works.
- Profile update and address save works.
- Admin login works.
- Product add/edit works with image upload.
- Razorpay small live test order works.
- Admin order status update sends email.
- Password reset or OTP email arrives.

## 8. Phone OTP Status

Phone OTP should remain disabled until SMS provider credentials and DLT templates are active.

Frontend env:

```env
NEXT_PUBLIC_PHONE_OTP_ENABLED=false
```

Backend env:

```env
PHONE_OTP_ENABLED=false
```

Backend env can keep Gupshup placeholders until ready. Do not enable phone OTP without live credentials.

## 9. Useful Health Commands

```bash
pm2 list
pm2 logs ewara-frontend --lines 100
pm2 logs ewara-backend --lines 100
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo mysql -e "USE ewara; SELECT COUNT(*) AS products FROM products;"
curl -I https://www.ewaraofficial.com
curl -I https://api.ewaraofficial.com
```
