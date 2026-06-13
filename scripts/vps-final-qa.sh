#!/usr/bin/env bash
set -uo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/ewara}"
FRONTEND_URL="${FRONTEND_URL:-https://www.ewaraofficial.com}"
API_URL="${API_URL:-https://api.ewaraofficial.com}"
DB_NAME="${DB_NAME:-ewara}"
ADMIN_EMAIL="${ADMIN_EMAIL:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
QA_TEST_EMAIL="${QA_TEST_EMAIL:-}"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
FIRST_PRODUCT_ID=""
FIRST_PRODUCT_CATEGORY=""
FIRST_PRODUCT_KEYWORD=""
ADMIN_TOKEN=""

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  green "PASS: $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  red "FAIL: $1"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  yellow "WARN: $1"
}

run_check() {
  local label="$1"
  shift

  if "$@" >/tmp/ewara-final-qa.out 2>/tmp/ewara-final-qa.err; then
    pass "$label"
  else
    fail "$label"
    sed 's/^/  /' /tmp/ewara-final-qa.err
  fi
}

check_url() {
  curl -fsSI --max-time 20 "$1" >/dev/null
}

check_json_url() {
  curl -fsS --max-time 20 "$1" >/dev/null
}

node_json_check() {
  local script="$1"
  node -e "
    let input = '';
    process.stdin.on('data', chunk => input += chunk);
    process.stdin.on('end', () => {
      try {
        const json = JSON.parse(input);
        ${script}
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });
  "
}

echo "== Ewara Final QA Smoke Test =="
echo "Project: $PROJECT_DIR"
echo "Frontend: $FRONTEND_URL"
echo "API: $API_URL"
echo

run_check "PM2 command available" command -v pm2
run_check "Node command available" command -v node
run_check "Curl command available" command -v curl

echo
echo "== PM2 =="
if pm2 list | tee /tmp/ewara-final-qa-pm2.txt; then
  grep -q "ewara-frontend" /tmp/ewara-final-qa-pm2.txt && pass "PM2 frontend process listed" || fail "PM2 frontend process listed"
  grep -q "ewara-backend" /tmp/ewara-final-qa-pm2.txt && pass "PM2 backend process listed" || fail "PM2 backend process listed"
  grep "ewara-frontend" /tmp/ewara-final-qa-pm2.txt | grep -q "online" && pass "PM2 frontend online" || fail "PM2 frontend online"
  grep "ewara-backend" /tmp/ewara-final-qa-pm2.txt | grep -q "online" && pass "PM2 backend online" || fail "PM2 backend online"
else
  fail "PM2 list"
fi

echo
echo "== Local Services =="
run_check "Local frontend responds on 127.0.0.1:3000" check_json_url "http://127.0.0.1:3000"
run_check "Local backend responds on 127.0.0.1:5000" check_json_url "http://127.0.0.1:5000"

echo
echo "== Public Pages =="
run_check "Home page loads" check_url "$FRONTEND_URL"
run_check "Shop page loads" check_url "$FRONTEND_URL/shop"
run_check "Login page loads" check_url "$FRONTEND_URL/login"
run_check "Cart page loads" check_url "$FRONTEND_URL/cart"
run_check "Wishlist page loads" check_url "$FRONTEND_URL/wishlist"
run_check "Privacy policy loads" check_url "$FRONTEND_URL/policies/privacy"
run_check "Terms policy loads" check_url "$FRONTEND_URL/policies/terms"
run_check "Refund policy loads" check_url "$FRONTEND_URL/policies/refund"
run_check "Shipping policy loads" check_url "$FRONTEND_URL/policies/shipping"
run_check "Robots endpoint loads" check_url "$FRONTEND_URL/robots.txt"
run_check "Sitemap endpoint loads" check_url "$FRONTEND_URL/sitemap.xml"

echo
echo "== Public API =="
run_check "Backend public root responds" check_json_url "$API_URL"

PRODUCT_JSON="$(curl -fsS --max-time 20 "$API_URL/api/products?limit=3" 2>/tmp/ewara-final-qa-products.err || true)"
if [ -n "$PRODUCT_JSON" ] && printf "%s" "$PRODUCT_JSON" | node_json_check "
  if (!json.success || !Array.isArray(json.products) || json.products.length === 0) {
    throw new Error('No products returned');
  }
  const first = json.products[0];
  if (!first.id || !first.name) throw new Error('Product payload missing id/name');
  console.log([first.id, first.category || '', String(first.name).split(/\\s+/)[0] || first.name].join('\\t'));
" >/tmp/ewara-final-qa-product-meta 2>/tmp/ewara-final-qa-product-parse.err; then
  pass "Shop products API returns products"
  IFS="$(printf '\t')" read -r FIRST_PRODUCT_ID FIRST_PRODUCT_CATEGORY FIRST_PRODUCT_KEYWORD < /tmp/ewara-final-qa-product-meta
else
  fail "Shop products API returns products"
  sed 's/^/  /' /tmp/ewara-final-qa-products.err
  sed 's/^/  /' /tmp/ewara-final-qa-product-parse.err
fi

if [ -n "$FIRST_PRODUCT_ID" ]; then
  run_check "Product detail API works for product $FIRST_PRODUCT_ID" check_json_url "$API_URL/api/products/$FIRST_PRODUCT_ID"
else
  warn "Product detail API skipped because no product ID was found"
fi

if [ -n "$FIRST_PRODUCT_CATEGORY" ]; then
  CATEGORY_URL="$API_URL/api/products?category=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$FIRST_PRODUCT_CATEGORY")&limit=3"
  run_check "Category filter API works for '$FIRST_PRODUCT_CATEGORY'" check_json_url "$CATEGORY_URL"
else
  warn "Category filter API skipped because first product category was empty"
fi

if [ -n "$FIRST_PRODUCT_KEYWORD" ]; then
  SEARCH_URL="$API_URL/api/products?keyword=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$FIRST_PRODUCT_KEYWORD")&limit=3"
  run_check "Search API works for '$FIRST_PRODUCT_KEYWORD'" check_json_url "$SEARCH_URL"
else
  warn "Search API skipped because no product keyword was found"
fi

echo
echo "== Optional Admin/API Checks =="
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  LOGIN_JSON="$(curl -fsS --max-time 20 -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"identifier\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" 2>/tmp/ewara-final-qa-admin-login.err || true)"

  if [ -n "$LOGIN_JSON" ] && ADMIN_TOKEN="$(printf "%s" "$LOGIN_JSON" | node_json_check "
    if (!json.success || !json.token) throw new Error(json.message || 'Admin login failed');
    if (!json.user || json.user.role !== 'admin') throw new Error('Login user is not admin');
    process.stdout.write(json.token);
  " 2>/tmp/ewara-final-qa-admin-login-parse.err)"; then
    pass "Admin login API works"
    run_check "Admin dashboard API works" curl -fsS --max-time 20 "$API_URL/api/admin/dashboard" -H "Authorization: Bearer $ADMIN_TOKEN"
  else
    fail "Admin login API works"
    sed 's/^/  /' /tmp/ewara-final-qa-admin-login.err
    sed 's/^/  /' /tmp/ewara-final-qa-admin-login-parse.err
  fi
else
  warn "Admin API checks skipped. Run with ADMIN_EMAIL and ADMIN_PASSWORD to verify admin login/dashboard."
fi

if [ -n "$QA_TEST_EMAIL" ]; then
  run_check "Email delivery test endpoint sends to $QA_TEST_EMAIL" curl -fsS --max-time 30 -X POST "$API_URL/api/email-test/send-verification" -H "Content-Type: application/json" -d "{\"testEmail\":\"$QA_TEST_EMAIL\"}"
else
  warn "Email delivery endpoint skipped. Run with QA_TEST_EMAIL=you@example.com to send a real email test."
fi

echo
echo "== Database =="
run_check "MySQL products/users/orders counts query" sudo mysql -N -e "USE ${DB_NAME}; SELECT 'products', COUNT(*) FROM products; SELECT 'users', COUNT(*) FROM users; SELECT 'orders', COUNT(*) FROM orders;"
run_check "Latest order JSON has items when orders exist" sudo mysql -N -e "USE ${DB_NAME}; SELECT COUNT(*) AS orders FROM orders; SELECT id, payment_method, payment_status, status, total_amount, JSON_LENGTH(items) AS item_count, created_at FROM orders ORDER BY id DESC LIMIT 1;"

echo
echo "== Nginx and SSL =="
run_check "Nginx config passes" sudo nginx -t
run_check "Nginx service active" systemctl is-active --quiet nginx

if command -v openssl >/dev/null 2>&1; then
  HOSTNAME="$(node -e "console.log(new URL(process.argv[1]).hostname)" "$FRONTEND_URL")"
  if echo | openssl s_client -servername "$HOSTNAME" -connect "$HOSTNAME:443" 2>/dev/null | openssl x509 -noout -dates >/tmp/ewara-final-qa-cert.txt 2>/tmp/ewara-final-qa-cert.err; then
    pass "SSL certificate readable for $HOSTNAME"
    sed 's/^/  /' /tmp/ewara-final-qa-cert.txt
  else
    fail "SSL certificate readable for $HOSTNAME"
    sed 's/^/  /' /tmp/ewara-final-qa-cert.err
  fi
else
  warn "OpenSSL not available; SSL date check skipped"
fi

echo
echo "== Environment Mode =="
if [ -f "$PROJECT_DIR/.env" ]; then
  grep -q "^NEXT_PUBLIC_PHONE_OTP_ENABLED=false" "$PROJECT_DIR/.env" && pass "Frontend phone OTP disabled" || warn "Frontend phone OTP is not explicitly disabled in $PROJECT_DIR/.env"
else
  warn "Frontend .env not found at $PROJECT_DIR/.env"
fi

if [ -f "$PROJECT_DIR/backend/.env" ]; then
  grep -q "^PHONE_OTP_ENABLED=false" "$PROJECT_DIR/backend/.env" && pass "Backend phone OTP disabled" || warn "Backend phone OTP is not explicitly disabled in $PROJECT_DIR/backend/.env"
else
  warn "Backend .env not found at $PROJECT_DIR/backend/.env"
fi

echo
echo "== Manual QA Still Required =="
cat <<'MANUAL'
- Product detail mobile images look proper on a real phone.
- Add to bag works from shop cards and product detail.
- Cart quantity update/remove works.
- Register/login email OTP works and email arrives in inbox/spam.
- Profile edit/address/avatar works from a logged-in account.
- Wishlist add/remove/move-to-bag works.
- COD order creates an order and clears cart.
- Razorpay live small order creates order after payment and clears cart.
- Order success page opens after COD and Razorpay.
- Admin order status update sends email.
- Razorpay dashboard webhook shows HTTP 200.
- Database counts increase after new user/order.
- Reboot survival: run pm2 save, reboot, then rerun this script.
MANUAL

echo
echo "== Summary =="
green "Passed: $PASS_COUNT"
yellow "Warnings: $WARN_COUNT"
if [ "$FAIL_COUNT" -eq 0 ]; then
  green "Failed: $FAIL_COUNT"
  echo "Final QA smoke test passed."
  exit 0
fi

red "Failed: $FAIL_COUNT"
echo "Fix failed checks before final handoff."
exit 1
