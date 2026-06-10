# Full Database Restore

Use this when you have a complete MySQL `.sql` dump for the Ewara VPS.

## Prerequisites

- `mysql` client installed on the VPS
- `backend/.env` filled with real database credentials
- Backend temporarily stopped or restarted after import

## Recommended flow

1. Upload the SQL dump to the VPS, for example:
   - `/var/www/ewara/backups/full-backup.sql`

2. Stop the backend briefly:

```bash
pm2 stop ewara-backend
```

3. Import the dump using the helper script:

```bash
cd /var/www/ewara/backend
node scripts/restore-mysql-dump.js ../backups/full-backup.sql
```

4. Start the backend again:

```bash
pm2 start ewara-backend
```

or, if you changed env vars:

```bash
pm2 restart ewara-backend --update-env
```

5. Verify the API:

```bash
curl http://127.0.0.1:5000/api/products
curl http://127.0.0.1:5000
```

## Notes

- If your dump already contains `CREATE DATABASE` and `USE` statements, make sure the target database name matches `backend/.env`.
- If the dump is from another server, confirm it uses the same table names and encoding.
- For a production restore, take a backup of the current database before importing.

## Optional backup before restore

```bash
mysqldump -u ewarauser -p ewara > /var/www/ewara/backups/pre-restore-backup.sql
```

## One-line restore command

If you prefer not to use the helper script:

```bash
mysql -h 127.0.0.1 -P 3306 -u ewarauser -p ewara < /var/www/ewara/backups/full-backup.sql
```
