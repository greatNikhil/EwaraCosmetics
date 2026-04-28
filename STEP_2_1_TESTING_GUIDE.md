# Step 2.1 - Order Tracking Testing Guide

**Status**: Ready to Test  
**Created**: April 24, 2026  
**Test Environment**: Development (localhost:3003 frontend, localhost:5000 backend)

---

## 📋 Quick Start

### Phase 1: Create Test Orders (5 minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Run seeding script (using TypeScript)
npx ts-node scripts/seed-test-orders.ts

# Expected output:
# ✅ Connected to MongoDB
# ✅ Using existing test user: [user_id]
# 🗑️  Cleared X old test orders
# ✅ Created 3 test orders
```

### Phase 2: Start Servers (2 minutes)

```bash
# Terminal 1: Start backend
cd backend
npm run dev
# Should show: Server running on port 5000

# Terminal 2: Start frontend (from root)
npm run dev
# Should show: compiled successfully on port 3003
```

### Phase 3: Test Frontend (10 minutes)

See **Manual Test Steps** below

---

## 🧪 Manual Test Steps

### Test A: Orders List Page (`/orders`)

**Expected Data**:
- 3 orders total
- Most recent first (newest to oldest)
- Mix of statuses: Processing, Pending, Shipped

**Test Steps**:

1. **Open Frontend**
   - Navigate to `http://localhost:3003`

2. **Login with Test User**
   - Email: `test@ewara.com`
   - Password: (try "password" or any password - seed script doesn't validate)
   - ℹ️ If login fails, the test user might not exist. Re-run seed script.

3. **Navigate to Orders**
   - Click "My Orders" in navbar, or
   - Go directly to `http://localhost:3003/orders`

4. **Verify Orders List Loads**
   - [ ] Page title shows "My Orders"
   - [ ] No loading spinner (or spinner disappears quickly)
   - [ ] No error messages in console

5. **Verify All 3 Orders Display**
   - [ ] First card shows "Order ID" label
   - [ ] First card shows order ID (MongoDB ObjectId)
   - [ ] First card shows product image thumbnail
   - [ ] First card shows product name
   - [ ] First card shows date in Indian format (e.g., "22 Apr 2026")
   - [ ] First card shows item count (e.g., "+ 1 more item(s)")
   - [ ] Status badge visible with color coding:
     - Processing = Red/Pink badge
     - Pending = Yellow/Orange badge  
     - Shipped = Green badge

6. **Verify Sort Order (Newest First)**
   - [ ] First card = "Processing" order (today)
   - [ ] Second card = "Pending" order (2 days ago)
   - [ ] Third card = "Shipped" order (5 days ago)

7. **Verify Pricing Display**
   - [ ] First order total: ~Rs. 1,532 (Vitamin C with GST)
   - [ ] Second order total: ~Rs. 3,378 (Moisturizer x2 - discount + GST + shipping)
   - [ ] Third order total: ~Rs. 3,117 (Vitamin C + Face Wash with GST)

**Screenshots to Take**:
- [ ] Full orders list page
- [ ] Each order card details
- [ ] Console for any errors

---

### Test B: Order Details Page (`/orders/[id]`)

**Test Steps**:

1. **Click on First Order (Processing Order)**
   - Click any order card
   - Should navigate to `/orders/[order_id]`

2. **Verify Page Loads**
   - [ ] No 404 error
   - [ ] Page title: "Order Details"
   - [ ] No loading spinner

3. **Verify Order Information Section**
   - [ ] Order ID displays correctly
   - [ ] Date shows: "Apr 22, 2026"
   - [ ] Status shows: "Processing"
   - [ ] Payment Method shows: "Razorpay"

4. **Verify Items Section**
   - [ ] Product image shows
   - [ ] Product name displays: "Vitamin C Serum"
   - [ ] Quantity shows: 1
   - [ ] Price shows: "Rs. 1,299"

5. **Verify Totals (if displayed)**
   - [ ] Subtotal: Rs. 1,299
   - [ ] GST (18%): Rs. 233
   - [ ] Shipping: Rs. 0 (Razorpay = free)
   - [ ] Total: Rs. 1,532

6. **Verify Shipping Address Section (if displayed)**
   - [ ] Full Name: "Test Delivery Address"
   - [ ] Phone: "9876543210"
   - [ ] Address: "123 Test Street, Apt 456"
   - [ ] City: "Bangalore"
   - [ ] State: "Karnataka"
   - [ ] Postal Code: "560001"

7. **Go Back to Orders List**
   - [ ] Click back button or "My Orders" link
   - [ ] Should return to `/orders` page
   - [ ] All 3 orders still visible

8. **Test Second Order (COD Order)**
   - [ ] Click on second order (Pending/COD)
   - [ ] Verify:
     - Status: "Pending"
     - Payment: "Cash on Delivery"
     - Shipping amount: Rs. 50
     - Items: 2x Moisturizing Cream
     - Coupon applied: "WELCOME100" (discount: Rs. 100)

9. **Test Third Order (Shipped Order)**
   - [ ] Click on third order (Shipped)
   - [ ] Verify:
     - Status: "Shipped"
     - Items: 1x Vitamin C Serum + 1x Face Wash
     - Correct pricing

**Screenshots to Take**:
- [ ] Processing order details
- [ ] COD order details
- [ ] Shipped order details

---

## 🔌 Backend API Tests

### Test C: `/api/orders/my` Endpoint

**Purpose**: Verify backend returns only authenticated user's orders

**Tool**: Use curl, Postman, or Bruno

```bash
# 1. Get test user's orders
curl -X GET http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json"

# Expected response (200 OK):
{
  "success": true,
  "count": 3,
  "orders": [
    {
      "_id": "order_id_1",
      "status": "Processing",
      "paymentMethod": "Razorpay",
      "totalAmount": 1532,
      "items": [
        {
          "name": "Vitamin C Serum",
          "quantity": 1,
          "price": 1299,
          ...
        }
      ],
      "createdAt": "2026-04-22T10:00:00.000Z"
    },
    ...
  ]
}
```

**Verify**:
- [ ] Response code: 200
- [ ] count = 3
- [ ] All orders belong to test user
- [ ] Orders sorted by createdAt (newest first)
- [ ] Each order has complete structure

**Test Without Token**:

```bash
# Should return 401 Unauthorized
curl -X GET http://localhost:5000/api/orders/my \
  -H "Content-Type: application/json"

# Expected response (401):
{
  "success": false,
  "message": "Unauthorized" or "No token provided"
}
```

---

### Test D: `/api/orders/:id` Endpoint

**Purpose**: Verify backend returns specific order

```bash
# Get specific order (replace :id with actual order ID from seed)
curl -X GET http://localhost:5000/api/orders/[order_id_from_seed] \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json"

# Expected response (200 OK):
{
  "success": true,
  "order": {
    "_id": "[order_id]",
    "user": "[user_id]",
    "items": [...],
    "totalAmount": 1532,
    "status": "Processing",
    ...
  }
}
```

**Verify**:
- [ ] Response code: 200
- [ ] Order details complete
- [ ] Matches what's shown in UI

**Test With Wrong Order ID**:

```bash
# Non-existent order
curl -X GET http://localhost:5000/api/orders/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer [token]"

# Expected: 404 Not Found or no order data
```

---

## 🔐 Security Tests

### Test E: Address/Data Isolation

**Purpose**: Verify User A cannot access User B's orders

**Prerequisites**:
- Test User 1: `test@ewara.com` (already seeded)
- Test User 2: Create new account during testing

**Test Steps**:

1. **Get Test User 1 Token**
   ```bash
   # Note down: [token_user_1]
   # From browser localStorage after login
   ```

2. **Note a Test User 1 Order ID**
   ```bash
   # From the /api/orders/my response
   # Example: [order_id_user_1]
   ```

3. **Create Test User 2**
   - Logout from User 1
   - Register new account: `test2@ewara.com`
   - Login to get Token: [token_user_2]

4. **Test: User 2 Cannot Access User 1's Orders**
   ```bash
   # User 2 tries to access User 1's order
   curl -X GET http://localhost:5000/api/orders/[order_id_user_1] \
     -H "Authorization: Bearer [token_user_2]"
   
   # Expected response:
   # - 403 Forbidden, OR
   # - 404 Not Found, OR
   # - Empty response
   # Should NOT return User 1's order data
   ```

5. **Test: User 2's /api/orders/my Returns Only User 2's Orders**
   ```bash
   curl -X GET http://localhost:5000/api/orders/my \
     -H "Authorization: Bearer [token_user_2]"
   
   # Should return empty array [] or only User 2's orders
   # Should NOT include any User 1 orders
   ```

**✅ Test Passes If**:
- User 2 cannot see User 1's order details
- User 2 gets 403/404 when accessing User 1's order ID
- No cross-user data leakage

---

### Test F: Token Validation

**Purpose**: Verify endpoints require valid authentication

```bash
# 1. Invalid token
curl -X GET http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer invalid.token.here"
# Expected: 401 Unauthorized

# 2. Expired token (if applicable)
curl -X GET http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer [very_old_token]"
# Expected: 401 Unauthorized

# 3. Missing Authorization header
curl -X GET http://localhost:5000/api/orders/my
# Expected: 401 Unauthorized
```

---

## ✅ Verification Checklist

Mark these as you test:

### Frontend (/orders page)
- [ ] Page loads without errors
- [ ] All 3 test orders display
- [ ] Orders sorted newest first
- [ ] Status badges show correct colors
- [ ] Dates formatted correctly (Indian format)
- [ ] Item counts correct
- [ ] Price totals correct
- [ ] Can click to view details
- [ ] Details page loads for each order
- [ ] Shipping address displays
- [ ] Items list shows all products
- [ ] Can navigate back to orders list
- [ ] No console errors

### Backend API (`/api/orders/my`)
- [ ] Returns 200 with auth token
- [ ] Returns 401 without token
- [ ] Returns only authenticated user's orders
- [ ] count = 3 for test user
- [ ] Orders sorted by createdAt (desc)
- [ ] Each order has all fields

### Backend API (`/api/orders/:id`)
- [ ] Returns 200 for valid order ID
- [ ] Returns order details correctly
- [ ] Returns 403/404 for another user's order
- [ ] Returns 404 for non-existent order

### Security
- [ ] User cannot access other user's orders
- [ ] Invalid tokens rejected
- [ ] Missing auth header rejected
- [ ] No data leakage between users

---

## 🐛 Troubleshooting

### Issue: Orders not showing on /orders page

**Check**:
1. Are servers running?
   ```bash
   # Terminal 1
   curl http://localhost:5000
   # Should show: Backend running successfully
   
   # Check frontend loads
   # Visit http://localhost:3003
   ```

2. Is user logged in?
   ```bash
   # Check localStorage in DevTools
   # Should have: token, isLoggedIn = true
   ```

3. Are test orders in database?
   ```bash
   # In MongoDB shell
   use ewara
   db.orders.find().count()
   # Should show: 3 (or more if you have previous orders)
   ```

4. Check browser console for errors
   - F12 → Console tab
   - Look for red error messages
   - Check Network tab for failed API calls

### Issue: "Order not found" error

**Check**:
1. Test user exists in database
   ```bash
   db.users.findOne({ email: "test@ewara.com" })
   # Should return user document
   ```

2. Orders have user ID field
   ```bash
   db.orders.find({ "shippingAddress.fullName": "Test Delivery Address" })
   # All should have "user" field populated
   ```

3. User token is valid
   ```bash
   # Check token in localStorage
   # Should be JWT format: xxx.xxx.xxx
   ```

### Issue: Different data from expected

**Debug Steps**:
1. Check MongoDB directly:
   ```bash
   db.orders.find().pretty()
   # View raw order data
   ```

2. Check API response:
   ```bash
   curl -H "Authorization: Bearer [token]" \
     http://localhost:5000/api/orders/my | jq
   ```

3. Compare with UI display

---

## 📊 Expected Test Results

| Metric | Expected | Status |
|--------|----------|--------|
| Orders List Page | Loads in < 1s | [ ] |
| Order Count | 3 orders | [ ] |
| Sort Order | Newest first | [ ] |
| Status Display | Correct colors | [ ] |
| Details Page | Loads for each order | [ ] |
| API Response | 200 with 3 orders | [ ] |
| Security | Cannot access other user's orders | [ ] |
| Token Validation | 401 without token | [ ] |
| Data Isolation | User A ≠ User B | [ ] |

---

## 📝 Test Report Template

```
Date: _______
Tester: _____
Frontend Port: 3003
Backend Port: 5000
Browser: Chrome / Firefox / Safari
OS: Windows / Mac / Linux

PASSED TESTS:
- [ ] Orders list page loads
- [ ] All 3 orders display
- [ ] Correct sorting
- [ ] Details pages work
- [ ] API endpoints working
- [ ] Security verified
- [ ] Data isolation confirmed

FAILED TESTS:
(None found - list any issues here)

ADDITIONAL NOTES:
(Any observations, unexpected behaviors, etc.)

Overall Result: ✅ PASS / ❌ FAIL
```

---

## 🎯 Next Steps After Step 2.1

After successfully testing this step, move to:

✅ **Step 2.2** - Test Order Details & Tracking UI (OrderTracker component)  
✅ **Step 3.1** - Test Admin Dashboard  
✅ **Phase 1** - Payment Foundation (if ready)

---

## 📚 Reference

- Frontend order pages: `app/orders/page.tsx`, `app/orders/[id]/page.tsx`
- Backend endpoints: `backend/src/routes/order.routes.ts`
- Order controller: `backend/src/controllers/order.controller.ts`
- Test user hook: `hooks/useOrders.ts`
- Seed script: `backend/scripts/seed-test-orders.ts`

---

**Last Updated**: April 24, 2026  
**Status**: Ready for Testing  
**Estimated Duration**: 30-45 minutes
