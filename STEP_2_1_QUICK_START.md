# Step 2.1 - Quick Execution Guide

## What You Have

✅ **Seeding Script**: `backend/scripts/seed-test-orders.js`
- Creates 3 test orders in MongoDB
- Different statuses: Processing (Razorpay), Pending (COD), Shipped
- No payment processing needed

✅ **Testing Guide**: `STEP_2_1_TESTING_GUIDE.md`
- Complete manual test steps
- Backend API tests with curl commands
- Security verification tests
- Troubleshooting guide

---

## Execute This Now

### Step 1: Seed Test Orders (5 min)

```bash
cd backend
npx ts-node scripts/seed-test-orders.ts
```

**Expected Output**:
```
🌱 Seeding test orders for Step 2.1...

✅ Connected to MongoDB
✅ Using existing test user: [user_id]
🗑️  Cleared X old test orders
✅ Created 3 test orders:

   Order 1: [order_id_1]
   - Status: Processing
   - Payment: Razorpay (Completed)
   - Total: Rs. 1532
   - Items: 1
   - Created: Mon Apr 22 2026

   Order 2: [order_id_2]
   - Status: Pending
   - Payment: Cash on Delivery (Pending)
   - Total: Rs. 3378
   - Items: 1
   - Created: Sat Apr 20 2026

   Order 3: [order_id_3]
   - Status: Shipped
   - Payment: Razorpay (Completed)
   - Total: Rs. 3117
   - Items: 2
   - Created: Thu Apr 17 2026

📋 Test User ID: [user_id]
📧 Test Email: test@ewara.com

✅ Seeding complete!

Next steps:
1. Start backend: cd backend && npm run dev
2. Start frontend: npm run dev
3. Login with: test@ewara.com / password
4. Navigate to /orders to see test orders
```

---

### Step 2: Start Backend (2 min)

**Terminal 1**:
```bash
cd backend
npm run dev
```

**Watch for**:
✅ `Server running on port 5000`
✅ `Connected to MongoDB`
✅ No error messages

---

### Step 3: Start Frontend (2 min)

**Terminal 2** (from project root):
```bash
npm run dev
```

**Watch for**:
✅ `compiled successfully`
✅ `ready on http://localhost:3003`

---

### Step 4: Test in Browser (20 min)

1. **Open** `http://localhost:3003`

2. **Login**:
   - Email: `test@ewara.com`
   - Password: `password` (or any password)

3. **Click** "My Orders" or go to `/orders`

4. **Verify**:
   - [ ] Page loads
   - [ ] 3 orders visible
   - [ ] Newest order first (Processing)
   - [ ] Correct totals and dates
   - [ ] Status badges have colors
   - [ ] Can click orders to see details

5. **Check Details Page**:
   - [ ] Order ID displays
   - [ ] Items list shows products
   - [ ] Shipping address displays
   - [ ] Correct status
   - [ ] Correct payment method

---

### Step 5: API Tests (5 min)

**Get Token** (from browser DevTools):
```
Open http://localhost:3003 → F12 → Application → LocalStorage
Copy the "token" value
```

**Test /api/orders/my**:
```bash
curl -X GET http://localhost:5000/api/orders/my \
  -H "Authorization: Bearer [paste_token_here]"
```

**Expected**: 200 response with 3 orders

**Test /api/orders/:id**:
```bash
# Copy an order ID from the response above
curl -X GET http://localhost:5000/api/orders/[order_id] \
  -H "Authorization: Bearer [token]"
```

**Expected**: 200 response with order details

---

## ✅ Success Criteria

All of these must pass:

- [ ] Seeding script runs without errors
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 3003
- [ ] Can login with test user
- [ ] `/orders` page loads and shows 3 orders
- [ ] Orders sorted newest first
- [ ] Can click orders to see details
- [ ] Order detail page shows all information
- [ ] API returns correct data
- [ ] No console errors

---

## 🎯 If Everything Works

When all checkmarks are filled ✅:

1. **Document Results**:
   - Take screenshots of orders list
   - Take screenshot of order detail page
   - Run curl tests and save output

2. **Mark Step 2.1 Complete** in IMPLEMENTATION_MANUAL.md

3. **Move to Step 2.2**: Test Order Details & Tracking UI

---

## ❌ If Something Breaks

**See Troubleshooting** in `STEP_2_1_TESTING_GUIDE.md`

Common issues:
- "Orders not showing" → Check token in localStorage
- "Order not found" → Check MongoDB has test data
- "API errors" → Check backend console for error messages
- "Login fails" → Re-run seed script to create test user

---

## 📋 Commands Reference

```bash
# Seed test orders (FIXED - now using TypeScript)
cd backend && npx ts-node scripts/seed-test-orders.ts

# Start backend
cd backend && npm run dev

# Start frontend  
cd .. && npm run dev

# Check if backend running
curl http://localhost:5000

# Check if frontend running
# Visit http://localhost:3003

# View MongoDB test orders
# (in MongoDB shell)
use ewara
db.orders.find().count()

# Get test user info
db.users.findOne({ email: "test@ewara.com" })
```

---

## ⏱️ Time Estimate

| Phase | Time |
|-------|------|
| Seed test orders | 2 min |
| Start servers | 3 min |
| Manual testing in browser | 15 min |
| API tests with curl | 5 min |
| **Total** | **~25 min** |

---

## 🚀 Ready to Start?

**Step 1**: Run the seed script
```bash
cd backend
node scripts/seed-test-orders.js
```

Let me know when you're ready or if you hit any issues!
