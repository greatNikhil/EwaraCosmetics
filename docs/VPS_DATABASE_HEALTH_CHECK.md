# VPS Database Health Check

Use this guide on the Hostinger VPS whenever you want to verify that the app and database are healthy.

## 1) SSH Into The VPS

```bash
ssh root@187.127.178.220
```

## 2) Check App Processes

```bash
pm2 list
pm2 logs ewara-frontend --lines 30
pm2 logs ewara-backend --lines 30
```

## 3) Check Nginx And Domain Routing

```bash
sudo nginx -t
curl -I https://ewaraofficial.com
curl -I https://www.ewaraofficial.com
curl -I https://api.ewaraofficial.com
```

## 4) Open MySQL

```bash
sudo mysql
```

Then run:

```sql
USE ewara;
```

## 5) Quick Database Overview

```sql
SHOW TABLES;
SELECT DATABASE();
```

## 6) Users Check

Latest users:

```sql
SELECT * FROM users ORDER BY id DESC LIMIT 10;
```

User count:

```sql
SELECT COUNT(*) AS total_users FROM users;
```

Find a specific user by email:

```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

Find a specific user by phone:

```sql
SELECT * FROM users WHERE phone = '9876543210';
```

If you are unsure about column names:

```sql
DESCRIBE users;
```

## 7) OTP Check

See pending OTP records:

```sql
SELECT * FROM otps ORDER BY id DESC LIMIT 10;
```

Remove stale OTPs if needed:

```sql
DELETE FROM otps WHERE expiresAt < NOW();
```

## 8) Products Check

Total products:

```sql
SELECT COUNT(*) AS total_products FROM products;
```

Published products:

```sql
SELECT COUNT(*) AS published_products FROM products WHERE is_published = 1;
```

Latest products:

```sql
SELECT * FROM products ORDER BY id DESC LIMIT 10;
```

Products by stock:

```sql
SELECT id, name, price, countInStock, is_published FROM products ORDER BY id DESC LIMIT 10;
```

## 9) Orders Check

Latest orders:

```sql
SELECT * FROM orders ORDER BY id DESC LIMIT 10;
```

Order count:

```sql
SELECT COUNT(*) AS total_orders FROM orders;
```

Orders for a specific user:

```sql
SELECT * FROM orders WHERE user = 1 ORDER BY id DESC;
```

## 10) Cart / Wishlist Checks

Cart items:

```sql
SELECT COUNT(*) AS total_cart_items FROM cart_items;
SELECT * FROM cart_items ORDER BY id DESC LIMIT 10;
```

Wishlist items:

```sql
SELECT COUNT(*) AS total_wishlist_items FROM wishlist_items;
SELECT * FROM wishlist_items ORDER BY id DESC LIMIT 10;
```

## 11) Reviews Check

```sql
SELECT COUNT(*) AS total_reviews FROM reviews;
SELECT * FROM reviews ORDER BY id DESC LIMIT 10;
```

## 12) Exit MySQL

```sql
EXIT;
```

## 13) Restart Commands After Any Code Change

If you change code on the VPS:

```bash
cd /var/www/ewara
git pull origin main

cd backend
npm run build

cd /var/www/ewara
npm run build

pm2 restart ewara-backend ewara-frontend --update-env
pm2 save
```

## 14) Email Test

To verify email delivery:

```bash
curl -X POST https://api.ewaraofficial.com/api/email-test/send-verification \
  -H "Content-Type: application/json" \
  -d "{\"testEmail\":\"yourpersonalemail@gmail.com\"}"
```

## 15) Fast Troubleshooting

If products do not show:
- Check `products` table count
- Check `is_published = 1`
- Check `pm2 logs ewara-backend`
- Check `curl -I https://api.ewaraofficial.com`

If users do not register:
- Check `users` table
- Check `otps` table
- Check backend logs

If email fails:
- Check `pm2 logs ewara-backend`
- Check `/var/www/ewara/backend/.env`
- Check `RESEND_API_KEY`
- Check `RESEND_FROM`

