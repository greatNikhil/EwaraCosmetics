# Quick Setup Guide - User Refund System

## 🎯 What Was Just Added

Users can now request **Returns**, **Exchanges**, and **Refunds** directly from their orders page!

---

## 📋 Files Added (9 New Files)

**Frontend (4 files):**
- ✅ `components/orders/ReturnRequestModal.tsx` - Return request form
- ✅ `components/orders/ExchangeRequestModal.tsx` - Exchange request form  
- ✅ `components/orders/RefundRequestModal.tsx` - Refund request form
- ✅ `components/orders/OrderCard.tsx` - MODIFIED to add action buttons

**Backend (5 files):**
- ✅ `backend/src/models/RefundRequest.ts` - User refund request model
- ✅ `backend/src/controllers/refundRequest.controller.ts` - User refund controller
- ✅ `backend/src/routes/refundRequest.routes.ts` - User refund API routes
- ✅ `backend/src/server.ts` - MODIFIED to register routes

---

## 🚀 How to Use

### Step 1: Restart Backend
```bash
# In backend folder
npm run dev
```

The new `refund_requests` table will be created automatically.

### Step 2: Test User Request
1. Go to **My Orders** page
2. Find a **Delivered** order
3. Click **"Request Refund"** button
4. Fill in amount, reason, and submit
5. Check email for confirmation

### Step 3: Admin Approval (Test)
Using Postman or terminal:

```bash
# List pending refund requests
curl http://localhost:5000/api/refund-requests \
  -H "Authorization: Bearer [admin-token]"

# Approve a request
curl -X PUT http://localhost:5000/api/refund-requests/1/approve \
  -H "Authorization: Bearer [admin-token]" \
  -H "Content-Type: application/json" \
  -d '{"adminNotes": "Approved"}'

# Process the approved refund
curl -X PUT http://localhost:5000/api/refund-requests/1/process \
  -H "Authorization: Bearer [admin-token]"
```

---

## ✨ Key Features

| Feature | Details |
|---------|---------|
| **User Returns** | Request product return with reason |
| **User Exchanges** | Request replacement with preferred size/color |
| **User Refunds** | Request partial or full refund |
| **Admin Approval** | Approve/reject with optional notes |
| **Emails** | Automatic confirmations at each step |
| **Smart Refund** | Instant (Razorpay) or 3-day (COD) detection |

---

## 📧 What Emails Are Sent?

✅ Return Request → `returnRequestCreated.html`  
✅ Exchange Request → `exchangeRequestCreated.html`  
✅ Refund Approved → `refundNotification.html`  
✅ Refund Processed → `refundNotification.html`

---

## 🔗 API Endpoints

**User Routes:**
- `POST /api/refund-requests/` - Create refund request
- `GET /api/refund-requests/my` - View my requests
- `PUT /api/refund-requests/:id/cancel` - Cancel request

**Admin Routes:**
- `GET /api/refund-requests/` - View all requests
- `PUT /api/refund-requests/:id/approve` - Approve
- `PUT /api/refund-requests/:id/reject` - Reject
- `PUT /api/refund-requests/:id/process` - Process approved

---

## 🐛 Troubleshooting

**Q: Buttons don't appear on orders?**
- Make sure order status is "Delivered"
- Clear browser cache
- Check browser console for errors

**Q: Email not arriving?**
- Check /backend/.env has EMAIL_FROM and EMAIL_PASS
- Check email spam folder
- Run `node test-email-delivery.js` in backend folder

**Q: API returns 403 Forbidden?**
- Make sure you're authenticated (have valid token)
- Check admin routes use admin-token

---

## 📝 Related Files

- Full implementation: [EXCHANGE_RETURN_REFUND_IMPLEMENTATION.md](EXCHANGE_RETURN_REFUND_IMPLEMENTATION.md)
- Detailed docs: [USER_INITIATED_REFUND_SYSTEM.md](USER_INITIATED_REFUND_SYSTEM.md)

---

## ✅ Verification Checklist

Before going live:

- [ ] Backend running: `npm run dev` (no errors)
- [ ] New table created: Check MySQL for `refund_requests` table
- [ ] User can create request from My Orders page
- [ ] Confirmation email arrives
- [ ] Admin can approve/reject in API
- [ ] Customer receives approval email
- [ ] Refund appears in payment gateway

---

**Need help?** Check the detailed docs files or reach out! 🎉
