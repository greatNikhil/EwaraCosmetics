# Final QA Checklist

Use this before final delivery and after every production deployment.

## 1. Deploy Latest Code

```bash
cd /var/www/ewara
git pull origin main
git rev-parse --short HEAD
npm install
npm run build
cd backend
npm install
npm run build
cd ..
pm2 restart ewara-frontend --update-env
pm2 restart ewara-backend --update-env
pm2 save
```

## 2. Run Automated VPS Smoke Test

Basic run:

```bash
cd /var/www/ewara
bash scripts/vps-final-qa.sh
```

With admin and email checks:

```bash
cd /var/www/ewara
ADMIN_EMAIL='admin@example.com' \
ADMIN_PASSWORD='admin-password' \
QA_TEST_EMAIL='your-inbox@example.com' \
bash scripts/vps-final-qa.sh
```

Expected:

- PM2 frontend/backend online.
- Local frontend/backend respond.
- Public home/shop/policies/robots/sitemap load.
- Products API returns products.
- Product detail, category filter, and search API respond.
- Nginx config passes.
- SSL certificate is readable.
- MySQL products/users/orders query runs.
- Phone OTP is disabled unless Gupshup is live.

## 3. Manual Frontend QA

Tick these in a real browser and on a real phone:

- [ ] Home page loads.
- [ ] Shop page loads products.
- [ ] Category filters work.
- [ ] Search works.
- [ ] Product detail mobile images look proper.
- [ ] Add to bag works from shop page.
- [ ] Add to bag works from product detail page.
- [ ] Cart quantity update works.
- [ ] Cart remove works.
- [ ] Wishlist page opens.
- [ ] Wishlist add/remove works.
- [ ] Wishlist move-to-bag works.
- [ ] Profile edit works.
- [ ] Address add/edit/delete/default works.
- [ ] Avatar upload and preview works.

## 4. Auth and OTP QA

- [ ] Register with email OTP.
- [ ] Login with email and password.
- [ ] Login with phone/password if a phone exists on the account.
- [ ] Forgot password email OTP works.
- [ ] Email OTP lands in inbox or spam.
- [ ] Phone OTP is either working with Gupshup or disabled in both env files.

Check phone OTP mode:

```bash
cd /var/www/ewara
grep PHONE_OTP .env backend/.env
```

Expected until Gupshup is live:

```env
NEXT_PUBLIC_PHONE_OTP_ENABLED=false
PHONE_OTP_ENABLED=false
```

## 5. Order QA

COD flow:

- [ ] Add product to bag.
- [ ] Checkout with COD.
- [ ] Order success page opens.
- [ ] Cart clears after order.
- [ ] Order appears in profile orders.
- [ ] Order appears in admin orders.
- [ ] Database has new order row.

Razorpay live small test:

- [ ] Add a low-value product to bag.
- [ ] Checkout with Razorpay.
- [ ] Complete payment.
- [ ] Redirect returns to site, not localhost.
- [ ] Order success page opens.
- [ ] Cart clears after payment.
- [ ] Order appears in admin.
- [ ] Razorpay dashboard payment is captured or expected status.
- [ ] Razorpay webhook delivery shows HTTP 200.

Database check after order:

```bash
sudo mysql -e "USE ewara; SELECT id, user, payment_method, payment_status, status, total_amount, JSON_LENGTH(items) AS item_count, created_at FROM orders ORDER BY id DESC LIMIT 5;"
```

## 6. Admin and Email QA

- [ ] Admin login works at `/admin`.
- [ ] Admin dashboard loads.
- [ ] Product add/edit works.
- [ ] Coupon create/validate works.
- [ ] Order status update works.
- [ ] Order status update sends email.
- [ ] Order confirmation email goes to inbox/spam.
- [ ] Payment success/failed emails are formatted properly.
- [ ] Refund/return/exchange emails are formatted properly if used.

Email delivery test:

```bash
curl -X POST https://api.ewaraofficial.com/api/email-test/send-verification \
  -H "Content-Type: application/json" \
  -d "{\"testEmail\":\"your-inbox@example.com\"}"
```

## 7. Razorpay Webhook QA

In Razorpay dashboard:

- [ ] Webhook URL is `https://www.ewaraofficial.com/api/webhooks/razorpay`.
- [ ] Webhook secret matches production env.
- [ ] Events are enabled for payment/order events used by the app.
- [ ] Latest delivery response is HTTP 200.

VPS env check:

```bash
cd /var/www/ewara
grep RAZORPAY .env .env.production.example backend/.env
```

Do not paste real secrets into docs, screenshots, or Git.

## 8. Infrastructure QA

```bash
pm2 list
sudo nginx -t
curl -I https://www.ewaraofficial.com
curl -I https://api.ewaraofficial.com
sudo certbot certificates
```

Expected:

- [ ] `ewara-frontend` online.
- [ ] `ewara-backend` online.
- [ ] Nginx config passes.
- [ ] HTTPS active.
- [ ] Certificate not near expiry.

Reboot survival test:

```bash
cd /var/www/ewara
pm2 save
sudo reboot
```

After reconnecting:

```bash
cd /var/www/ewara
pm2 list
sudo systemctl status nginx --no-pager
bash scripts/vps-final-qa.sh
```

Expected:

- [ ] PM2 survives restart.
- [ ] Nginx active.
- [ ] Website loads on HTTPS.

## 9. Final Sign-Off

Only hand off when:

- [ ] Automated VPS smoke test passes.
- [ ] Manual mobile product image QA passes.
- [ ] COD order passes.
- [ ] Razorpay live small order passes.
- [ ] Email delivery checked in inbox/spam.
- [ ] Razorpay webhook delivery is HTTP 200.
- [ ] New user/order data is visible in database/admin.
- [ ] PM2, Nginx, SSL are verified.
