#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/ewara}"
FRONTEND_URL="${FRONTEND_URL:-https://www.ewaraofficial.com}"
API_URL="${API_URL:-https://api.ewaraofficial.com}"
RUN_CERTBOT_DRY_RUN="${RUN_CERTBOT_DRY_RUN:-0}"

echo "== PM2 =="
pm2 list

echo
echo "== Local services =="
curl -fsS http://127.0.0.1:3000 >/dev/null
echo "Frontend local OK"
curl -fsS http://127.0.0.1:5000 >/dev/null
echo "Backend local OK"

echo
echo "== Public URLs =="
curl -fsSI "$FRONTEND_URL" | head -n 1
curl -fsSI "$API_URL" | head -n 1

echo
echo "== Nginx =="
sudo nginx -t
systemctl is-active --quiet nginx
echo "Nginx active"

echo
echo "== MySQL =="
sudo mysql -e "USE ewara; SELECT COUNT(*) AS products FROM products;"

if [[ "$RUN_CERTBOT_DRY_RUN" == "1" ]]; then
  echo
  echo "== Certbot dry run =="
  sudo certbot renew --dry-run
else
  echo
  echo "Skipping certbot dry run. Run with RUN_CERTBOT_DRY_RUN=1 to test renewal."
fi

echo
echo "== Git =="
cd "$PROJECT_DIR"
git rev-parse --short HEAD
git status --short

echo
echo "Health check complete."
