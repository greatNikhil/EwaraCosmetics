# Ewara VPS Quick Access Guide

This is the one-file runbook for day-to-day access and deployment on the Hostinger VPS.

## Server Details

- VPS IP: `187.127.178.220`
- Project path on VPS: `/var/www/ewara`
- Frontend port: `3000`
- Backend port: `5000`
- MySQL port: `3306`

## 1) Login to VPS

### SSH from your laptop

```bash
ssh root@187.127.178.220
```

### Hostinger browser terminal

- Open Hostinger VPS terminal
- You are already logged in as `root`

## 2) Go to the project folder

```bash
cd /var/www/ewara
```

Useful checks:

```bash
pwd
ls
```

## 3) Frontend access and checks

### Start/verify frontend

```bash
pm2 list
pm2 logs ewara-frontend --lines 50
curl http://127.0.0.1:3000
```

### Rebuild frontend after code updates

```bash
cd /var/www/ewara
git pull origin main
npm install
npm run build
pm2 restart ewara-frontend --update-env
pm2 save
```

### Clear stale Next.js build if you see old/new deployment errors

```bash
cd /var/www/ewara
rm -rf .next
npm run build
pm2 restart ewara-frontend --update-env
pm2 save
```

## 4) Backend access and checks

### Verify backend

```bash
pm2 logs ewara-backend --lines 50
curl http://127.0.0.1:5000
```

### Rebuild backend after code updates

```bash
cd /var/www/ewara/backend
npm install
npm run build
cd /var/www/ewara
pm2 restart ewara-backend --update-env
pm2 save
```

### Clear backend build output if needed

```bash
cd /var/www/ewara/backend
rm -rf dist
npm run build
cd /var/www/ewara
pm2 restart ewara-backend --update-env
pm2 save
```

## 5) Database access

### Open MySQL shell as root

```bash
sudo mysql
```

### Login as app user

```bash
mysql -u ewarauser -p -h 127.0.0.1 ewara
```

### Common SQL commands

```sql
SHOW DATABASES;
USE ewara;
SHOW TABLES;
SELECT COUNT(*) FROM products;
SELECT * FROM products LIMIT 10;
SELECT * FROM users LIMIT 10;
EXIT;
```

### Check database tables from shell

```bash
sudo mysql -e "USE ewara; SHOW TABLES;"
sudo mysql -e "USE ewara; SELECT COUNT(*) FROM products;"
```

### Restore full SQL dump

If the file `ewaraSchema.sql` is present in `/var/www/ewara`:

```bash
cd /var/www/ewara
mysql --default-character-set=utf8mb4 -u ewarauser -p ewara < ewaraSchema.sql
```

If you want to use the helper script from the repo:

```bash
cd /var/www/ewara
node backend/scripts/restore-mysql-dump.js ewaraSchema.sql
```

## 6) MySQL Workbench from your laptop

Use SSH tunneling:

- Connection Method: `Standard TCP/IP over SSH`
- SSH Hostname: `187.127.178.220:22`
- SSH Username: `root`
- SSH Password: your VPS password
- MySQL Hostname: `127.0.0.1`
- MySQL Server Port: `3306`
- Username: `ewarauser`
- Password: your MySQL password

## 7) Nginx access and checks

### Test config

```bash
sudo nginx -t
```

### Reload Nginx

```bash
sudo systemctl reload nginx
```

### Check Nginx status

```bash
sudo systemctl status nginx --no-pager
```

### Nginx config locations

- Site config: `/etc/nginx/sites-available/`
- Enabled configs: `/etc/nginx/sites-enabled/`

## 8) PM2 operations

### List processes

```bash
pm2 list
```

### Restart both apps

```bash
pm2 restart ewara-frontend --update-env
pm2 restart ewara-backend --update-env
pm2 save
```

### Stop/start if required

```bash
pm2 stop ewara-frontend
pm2 stop ewara-backend
pm2 start ecosystem.config.cjs
pm2 save
```

## 9) Rotate admin password

```bash
cd /var/www/ewara/backend
ADMIN_EMAIL='admin@example.com' ADMIN_PASSWORD='new-strong-password' npm run rotate:admin-password
pm2 restart ewara-backend --update-env
pm2 save
```

## 10) Git deployment flow

Whenever you push new code from your laptop:

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
```

## 11) Quick health checks

```bash
pm2 list
curl http://127.0.0.1:3000
curl http://127.0.0.1:5000
sudo nginx -t
sudo mysql -e "USE ewara; SHOW TABLES;"
```

Full production health script:

```bash
cd /var/www/ewara
bash scripts/vps-health-check.sh
```

With SSL renewal dry-run:

```bash
cd /var/www/ewara
RUN_CERTBOT_DRY_RUN=1 bash scripts/vps-health-check.sh
```

## 12) Logs for troubleshooting

Frontend:

```bash
pm2 logs ewara-frontend --lines 100
```

Backend:

```bash
pm2 logs ewara-backend --lines 100
```

Nginx:

```bash
sudo tail -n 100 /var/log/nginx/error.log
sudo tail -n 100 /var/log/nginx/access.log
```

## 13) SSL after DNS is live

When your domain points to the VPS:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ewaraofficial.com -d www.ewaraofficial.com -d api.ewaraofficial.com
```

## 14) Backups

Manual backup:

```bash
cd /var/www/ewara
bash scripts/vps-backup.sh
```

Daily cron:

```bash
crontab -e
```

Add:

```cron
15 2 * * * cd /var/www/ewara && bash scripts/vps-backup.sh >> /var/log/ewara-backup.log 2>&1
```

Backup locations:

- `/var/backups/ewara/db`
- `/var/backups/ewara/uploads`

## 15) Product image uploads

- Admin product add/edit pages can upload images directly.
- Files are stored in `/var/www/ewara/public/uploads/products`.
- Product database rows store image paths like `/uploads/products/example.webp`.
- Include `/var/www/ewara/public/uploads` in backups.

## 16) Common notes

- If you see `Server Action` errors in Next.js, clear `.next` and rebuild.
- If backend logs show `ENOTFOUND <YOUR_DB_HOST>`, check `.env` on the VPS.
- If public domain is not opening but `curl 127.0.0.1:3000` works, DNS or Nginx is the issue.
- If the cart or bag behaves oddly, test in an incognito window to avoid stale browser cache.
