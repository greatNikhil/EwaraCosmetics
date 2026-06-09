# Step 2.2 - Order Details & Tracking UI Testing Guide

**Status**: Ready to Test  
**Current**: Order detail page exists but needs enhancement  
**Objective**: Verify order details page displays all information correctly

---

## 📋 What We're Testing

✅ **Already Working**:
- Order detail page loads (`/orders/[id]`)
- Displays order ID, date, status, payment method
- Shows items list with quantities and prices
- Shows total amount

⚠️ **Need to Verify/Enhance**:
- [ ] Complete pricing breakdown (subtotal, discount, GST, shipping)
- [ ] Shipping address display
- [ ] Payment status
- [ ] OrderTracker component integration
- [ ] Responsive design on mobile

---

## 🧪 Manual Testing Steps

### Phase 1: Test Orders List Page (Refresh Memory)

1. **Go to** `http://localhost:3003/orders`
2. **Verify you see**:
   - [ ] 3 test orders in list
   - [ ] Most recent order first (today's date)
   - [ ] Status badges with colors
   - [ ] Order totals visible

---

### Phase 2: Test Order Details Page

#### **Test Order 1: Processing (Razorpay)**

1. **Click first order** (Processing/Razorpay)
   - URL should change to `/orders/[id]`
   
2. **Verify basic info**:
   - [ ] Page title: "Order Details"
   - [ ] Order ID visible and correct
   - [ ] Date shows: "Apr 24, 2026" (today)
   - [ ] Status shows: "Processing"
   - [ ] Payment method: "Razorpay"

3. **Verify items list**:
   - [ ] Item 1: "Vitamin C Serum"
   - [ ] Quantity: 1
   - [ ] Price: Rs. 1,299

4. **Check total**:
   - [ ] Total shows: Rs. 1,533

5. **Verify using browser DevTools** (F12):
   - [ ] No red errors in Console
   - [ ] Network tab shows successful API call to `/api/orders/[id]`
   - [ ] Response includes all order data

---

#### **Test Order 2: Pending (COD)**

1. **Go back** to `/orders`
   - [ ] Can click back button or navbar "My Orders"

2. **Click second order** (Pending/COD)

3. **Verify**:
   - [ ] Order ID correct
   - [ ] Date shows: "Apr 22, 2026" (2 days ago)
   - [ ] Status: "Pending"
   - [ ] Payment method: "Cash on Delivery"

4. **Verify items**:
   - [ ] Item: "Moisturizing Cream"
   - [ ] Quantity: 2
   - [ ] Price: Rs. 899 each

5. **Check total**:
   - [ ] Total shows: Rs. 2,054

---

#### **Test Order 3: Shipped (Razorpay)**

1. **Go back** to `/orders`

2. **Click third order** (Shipped)

3. **Verify**:
   - [ ] Status: "Shipped"
   - [ ] Date: "Apr 19, 2026" (5 days ago)

4. **Verify items**:
   - [ ] Item 1: "Vitamin C Serum" × 1
   - [ ] Item 2: "Face Wash" × 1

5. **Check total**:
   - [ ] Total shows: Rs. 2,122

---

## 🔍 What's MISSING (Need to Enhance)

The current order detail page is missing these important sections:

### Missing 1: Pricing Breakdown

**Should show**:
```
Subtotal:       Rs. 1,299
GST (18%):      Rs. 233
Shipping:       Rs. 0 (Razorpay) or Rs. 50 (COD)
Discount:       Rs. 0 (or actual discount if coupon used)
─────────────────────────
Total:          Rs. 1,532
```

**How to check in database**:
```bash
# For each test order, verify these fields exist:
- subtotalAmount
- gstAmount
- shippingAmount
- discountAmount
- totalAmount
```

### Missing 2: Shipping Address

**Should show**:
```
Shipping Address:
Full Name:      Test Delivery Address
Phone:          9876543210
Address Line 1: 123 Test Street
Address Line 2: Apt 456
City:           Bangalore
State:          Karnataka
Postal Code:    560001
Country:        India
```

**How to check in database**:
```bash
# Each order should have shippingAddress with all fields
db.orders.findOne({ _id: ObjectId("[order_id]") }).shippingAddress
```

### Missing 3: Payment Status

**Should show**:
```
Payment Status: Completed (for Razorpay)
                Pending (for COD)
```

**Current**: The page doesn't display `paymentStatus` field

### Missing 4: Order Tracker Component

**Not currently integrated** in the order detail page

**Should show a timeline**:
```
✓ Order Placed (Apr 24, 2026)
→ Processing (Current)
→ Shipped
→ Delivered
```

---

## 🚀 What I'll Do Now

I'll enhance the order detail page to include:

1. ✅ Complete pricing breakdown
2. ✅ Shipping address section
3. ✅ Payment status
4. ✅ Order tracker timeline
5. ✅ Better mobile responsiveness
6. ✅ Status badge with color coding

---

## 📊 Test Data Verification

Before enhancement, verify your test orders have all required fields:

```bash
# In MongoDB shell:
use ewara
db.orders.find().forEach(doc => {
  print("Order: " + doc._id);
  print("  User: " + doc.user);
  print("  Status: " + doc.status);
  print("  Payment Status: " + doc.paymentStatus);
  print("  Subtotal: " + doc.subtotalAmount);
  print("  GST: " + doc.gstAmount);
  print("  Shipping: " + doc.shippingAmount);
  print("  Discount: " + doc.discountAmount);
  print("  Total: " + doc.totalAmount);
  print("  Address: " + JSON.stringify(doc.shippingAddress));
  print("---");
})
```

**Expected output**: All fields present for each order

---

## 🎯 Next Actions

**I will now**:
1. Enhance order detail page with all missing information
2. Add proper pricing breakdown display
3. Add shipping address section
4. Integrate OrderTracker component
5. Ensure responsive design

**You will then**:
1. Refresh the page in browser
2. Test each of the 3 orders
3. Verify all new sections display correctly
4. Confirm responsive design on mobile (DevTools)
5. Report if everything looks good ✅

---

## ⏱️ Time Estimate

- Enhancement: ~5 minutes
- Manual testing: ~10 minutes
- Total: ~15 minutes

---

**Ready for me to enhance the order detail page?**

Reply: **Yes, enhance it** or **Show me first** if you want to see the code before I implement
