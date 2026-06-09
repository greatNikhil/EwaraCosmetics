# User-Initiated Refund Request System - Implementation Complete

## 🎯 Overview
Added a complete user-initiated refund request system that allows customers to request refunds directly from their orders, with admin approval workflow.

---

## 📦 Files Created

### 1. **Backend Model** 
- **File:** `backend/src/models/RefundRequest.ts` (NEW)
- **Purpose:** Tracks user-initiated refund requests with approval workflow
- **Status Enum:** Pending | Approved | Rejected | Processed | Cancelled
- **Key Fields:** user (FK), order (FK), amount, reason, refundMethod, adminNotes

### 2. **Backend Controller**
- **File:** `backend/src/controllers/refundRequest.controller.ts` (NEW)
- **Purpose:** Handles all refund request operations

**User Endpoints:**
- `POST /api/refund-requests/` - Create refund request
- `GET /api/refund-requests/my` - Get user's refund requests
- `GET /api/refund-requests/:id` - Get specific request
- `PUT /api/refund-requests/:id/cancel` - Cancel pending request

**Admin Endpoints:**
- `GET /api/refund-requests/` - Get all requests (with optional status filter)
- `PUT /api/refund-requests/:id/approve` - Approve request
- `PUT /api/refund-requests/:id/reject` - Reject request
- `PUT /api/refund-requests/:id/process` - Process approved refund

### 3. **Backend Routes**
- **File:** `backend/src/routes/refundRequest.routes.ts` (NEW)
- **Purpose:** API endpoints for refund requests

### 4. **Frontend Components** (3 Modal Files)

#### `components/orders/ReturnRequestModal.tsx` (NEW)
- Users request returns with reason & description
- Calls `POST /api/returns/`
- Reasons: Damaged, Wrong Item, Not As Described, Size/Fit, Color, Changed Mind, Quality, Other

#### `components/orders/ExchangeRequestModal.tsx` (NEW)
- Users request exchanges with replacement details
- Calls `POST /api/exchanges/`
- Reasons: Wrong Size, Color, Defective, Not As Described, Quality, Other
- Includes field for desired size/color

#### `components/orders/RefundRequestModal.tsx` (NEW)
- Users request refunds with partial/full amount options
- Calls `POST /api/refund-requests/`
- Shows instant vs pending refund timeline
- Reasons: Not As Described, Defective, Changed Mind, Duplicate, Wrong Item, Other

### 5. **Frontend Updated Component**
- **File:** `components/orders/OrderCard.tsx` (MODIFIED)
- Added state management for 3 modals
- Added action buttons below delivered orders
- Buttons: Request Return, Request Exchange, Request Refund

---

## 📊 Backend Integration

### Updated Files:
1. **`backend/src/server.ts`** (MODIFIED)
   - Added import: `import RefundRequest from "./models/RefundRequest"`
   - Added import: `import refundRequestRoutes from "./routes/refundRequest.routes"`
   - Added route: `app.use("/api/refund-requests", refundRequestRoutes);`

---

## 🔄 User Workflow

### Customer Journey:
```
User views delivered order
    ↓
Clicks "Request Return" / "Request Exchange" / "Request Refund"
    ↓
Fills form with reason & details
    ↓
Submits request
    ↓
Email confirmation sent
    ↓
Admin reviews in dashboard
    ↓
Admin approves/rejects
    ↓
Customer receives notification
```

### Admin Workflow:
```
Admin views pending refund requests
    ↓
Clicks "Approve" or "Reject"
    ↓
Adds optional admin notes
    ↓
For approved: Clicks "Process" to create actual refund
    ↓
Refund processed and email sent to customer
```

---

## 📧 Email Notifications

**Automatic Emails Sent:**

| Event | Template | Recipient |
|-------|----------|-----------|
| Return requested | `returnRequestCreated` | Customer |
| Exchange requested | `exchangeRequestCreated` | Customer |
| Refund request approved | `refundNotification` | Customer |
| Refund processed | `refundNotification` | Customer |

**Smart Refund Email:**
- **Instant Refund** (Razorpay/Card/UPI): "Refund credited immediately"
- **Pending Refund** (COD/Bank): "Refund within 3 business days"

---

## 🔐 Security & Permissions

✅ **User Routes:** Protected with `authMiddleware` only
✅ **Admin Routes:** Protected with `authMiddleware` + `adminMiddleware`
✅ **User Isolation:** Users can only see/cancel their own requests
✅ **Order Validation:** Refund amount cannot exceed order total
✅ **Status Validation:** Can only cancel Pending requests

---

## 📱 Frontend UI Features

### Action Buttons (shown on delivered orders):
- 3 buttons appear below order cards: Return, Exchange, Refund
- Buttons are hidden for non-delivered orders
- Professional styling with brand colors

### Modal Features:
- ✅ Smooth animations with success confirmation
- ✅ Pre-filled product/order info
- ✅ Radio button selection for reasons
- ✅ Optional description/notes textarea
- ✅ Real-time validation & error messages
- ✅ Loading states on submit button
- ✅ Success screen before closing

---

## 🧪 Testing the Feature

### User Requests a Return:
```
1. Click "Request Return" on delivered order
2. Select reason (e.g., "Size/Fit Issue")
3. Add details in textarea
4. Click "Submit Return Request"
5. See success confirmation
6. Check email for return request confirmation
```

### Admin Approves Refund:
```
1. Go to admin panel
2. Navigate to Refund Requests section
3. View pending requests
4. Click "Approve" and add notes (optional)
5. Click "Process" to create actual refund
6. Customer receives refund notification email
```

### Partial Refund:
```
1. Click "Request Refund"
2. Change amount from order total to desired amount
3. Select reason
4. Submit
5. Email shows partial refund amount
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│     RefundRequest Model (NEW)           │
│  Pending → Approved → Processed/Rejected│
└──────────────┬──────────────────────────┘
               │
               ├─→ If Approved: Admin reviews
               │
               └─→ If Processed: Creates actual Refund record
                                 Sends email to customer
```

---

## ⚠️ Important Notes

1. **Refund Request ≠ Actual Refund**
   - Refund Request (NEW): User initiates → Admin approves
   - Actual Refund (Existing): Created after approval, triggers payment

2. **Email Triggers**
   - Return/Exchange requests send immediately
   - Refund emails only on approval/processing (not on request submission)

3. **Database Sync**
   - New table `refund_requests` will be created on next server start
   - Set `alter: false` in db.ts (already configured)

---

## 🚀 Next Steps

1. ✅ Backend: Deploy new models, controllers, routes
2. ✅ Frontend: Deploy modal components and updated OrderCard
3. ⏳ Test: Verify all 3 request types work
4. ⏳ Admin: Create admin dashboard view for managing requests
5. ⏳ Analytics: Add reporting for request/approval rates

---

## 📝 API Reference

### Create Return Request
```bash
POST /api/returns/
Authorization: Bearer [token]
{
  "orderId": 1,
  "productId": 5,
  "reason": "Size/Fit Issue",
  "description": "Received larger size than ordered"
}
```

### Create Exchange Request
```bash
POST /api/exchanges/
Authorization: Bearer [token]
{
  "orderId": 1,
  "productId": 5,
  "reason": "Wrong Size",
  "description": "Need size M instead of L",
  "replacementProduct": "Size M in Red"
}
```

### Create Refund Request (USER)
```bash
POST /api/refund-requests/
Authorization: Bearer [token]
{
  "orderId": 1,
  "amount": 499.99,
  "reason": "Not As Described",
  "refundMethod": "Original Payment"
}
```

### Approve Refund Request (ADMIN)
```bash
PUT /api/refund-requests/:id/approve
Authorization: Bearer [admin-token]
{
  "adminNotes": "Approved - product was defective"
}
```

### Process Approved Refund (ADMIN)
```bash
PUT /api/refund-requests/:id/process
Authorization: Bearer [admin-token]
```

---

## Summary
- ✅ Users can now request returns, exchanges, and refunds directly
- ✅ Admins have dedicated workflow to approve/reject/process
- ✅ Professional UI with modals on orders page
- ✅ Automatic email notifications at each stage
- ✅ Full audit trail with timestamps and admin notes
- ✅ Smart refund detection (instant vs pending)
