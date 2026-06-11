#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/ewara}"
ENV_FILE="${ENV_FILE:-$PROJECT_DIR/backend/.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/ewara}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

read_env() {
  local key="$1"
  if [[ ! -f "$ENV_FILE" ]]; then
    return 0
  fi

  grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'
}

DB_HOST="${DB_HOST:-$(read_env DB_HOST)}"
DB_PORT="${DB_PORT:-$(read_env DB_PORT)}"
DB_USER="${DB_USER:-$(read_env DB_USER)}"
DB_PASSWORD="${DB_PASSWORD:-$(read_env DB_PASSWORD)}"
DB_NAME="${DB_NAME:-$(read_env DB_NAME)}"

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-ewarauser}"
DB_NAME="${DB_NAME:-ewara}"

mkdir -p "$BACKUP_DIR/db" "$BACKUP_DIR/uploads"

if [[ -z "$DB_PASSWORD" ]]; then
  echo "DB_PASSWORD was not found. Set DB_PASSWORD or check $ENV_FILE." >&2
  exit 1
fi

export MYSQL_PWD="$DB_PASSWORD"

DB_BACKUP="$BACKUP_DIR/db/${DB_NAME}-${STAMP}.sql.gz"
UPLOADS_BACKUP="$BACKUP_DIR/uploads/uploads-${STAMP}.tar.gz"

echo "Creating MySQL backup: $DB_BACKUP"
mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  -u "$DB_USER" \
  "$DB_NAME" | gzip > "$DB_BACKUP"

if [[ -d "$PROJECT_DIR/public/uploads" ]]; then
  echo "Creating uploads backup: $UPLOADS_BACKUP"
  tar -czf "$UPLOADS_BACKUP" -C "$PROJECT_DIR/public" uploads
else
  echo "No public/uploads directory found; skipping uploads backup."
fi

find "$BACKUP_DIR" -type f \( -name "*.sql.gz" -o -name "uploads-*.tar.gz" \) -mtime +"$RETENTION_DAYS" -delete

echo "Backup complete."
echo "Database: $DB_BACKUP"
if [[ -f "$UPLOADS_BACKUP" ]]; then
  echo "Uploads: $UPLOADS_BACKUP"
fi
