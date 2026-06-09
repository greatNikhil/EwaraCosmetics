# RAZORPAY INTEGRATION GUIDE

## ✅ Razorpay is Now Integrated!

This guide explains how to set up and test Razorpay payments for Ewara Cosmetics.

---

## 📊 WHAT'S BEEN SET UP

### Installed Packages
- ✅ `razorpay` - Razorpay Node.js SDK
- ✅ All packages installed in both frontend and backend

### API Routes Created
- ✅ `app/api/checkout/razorpay/route.ts` - Creates Razorpay orders
- ✅ `app/api/webhooks/razorpay/route.ts` - Handles payment webhooks

### Component Updates
- ✅ `CheckoutModal.tsx` - Updated with Razorpay payment handler
- ✅ Razorpay script loads from CDN automatically

### Environment Files Updated
- ✅ `.env.local` - Frontend Razorpay key placeholder
- ✅ `backend/.env` - Backend Razorpay keys

---

## 🚀 STEP 1: CREATE RAZORPAY ACCOUNT

1. **Go to:** https://razorpay.com/
2. **Click:** "Sign Up" button
3. **Fill in:**
   - Email
   - Password
   - Phone number (Indian mobile)
4. **Verify:** Email and phone
5. **Complete:** KYC (if required for live payments)

---

## 🔑 STEP 2: GET YOUR API KEYS

1. **Log in** to https://dashboard.razorpay.com/
2. **Navigate:** Settings → API Keys (left sidebar)
3. **Copy your keys:**
   - **Key ID** (like `rzp_test_abc123xyz`)
   - **Key Secret** (like `AbC123xYz789pQr`)

### ⚠️ Important Notes
- **Test Keys:** Start with `rzp_test_` (for development)
- **Live Keys:** Start with `rzp_live_` (for production)
- **Keep Secret Safe:** Never share your Key Secret!

---

## 📝 STEP 3: ADD KEYS TO ENVIRONMENT FILES

### Frontend (.env.local)
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

**Replace:** `YOUR_KEY_ID_HERE` with your actual Key ID

### Backend (backend/.env)
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Replace:**
- `YOUR_KEY_ID_HERE` → Your Key ID
- `YOUR_KEY_SECRET_HERE` → Your Key Secret

---

## 🧪 STEP 4: TEST WITH TEST KEYS

### Test Card Numbers

**Successful Payment:**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

**Payment Requires Authentication:**
```
Card Number: 4000 0027 2000 3093
Expiry: Any future date
CVV: Any 3 digits
```

**Failed Payment:**
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVV: Any 3 digits
```

### Test UPI IDs
- `success@razorpay` - Successful payment
- `failure@razorpay` - Failed payment

---

## 🎯 STEP 5: TEST PAYMENT FLOW

### Prerequisites
- Frontend running: `npm run dev` (port 3000)
- Backend running: `npm run dev` (port 5000)
- Keys added to .env files

### Test Flow
1. **Go to:** http://localhost:3000
2. **Register:** Create account if not done
3. **Login:** With your credentials
4. **Add Products:** To cart (any items)
5. **Checkout:** Click checkout button
6. **Payment Method:** Select "Razorpay - All Methods"
7. **Place Order:** Click "Place Order"
8. **Razorpay Form:** Fill in test card details above
9. **Complete:** The payment form appears in a modal

---

## 📱 PAYMENT METHODS IN RAZORPAY

Once integrated, users can pay via:

### Credit/Debit Cards
- Visa
- Mastercard
- Rupay

### UPI (Most Popular in India)
- Google Pay
- PhonePe
- PayTM
- BHIM

### Wallets
- Amazon Pay
- Mobikwik
- Airtel Money

### Net Banking
- All major Indian banks

### EMI (On eligible amounts)
- HDFC Bank
- ICICI Bank
- Axis Bank
- Others

---

## 🔄 HOW IT WORKS

### Payment Flow

```
1. User clicks "Place Order"
   ↓
2. Frontend calls `/api/checkout/razorpay`
   ↓
3. Backend creates Razorpay order (returns orderId)
   ↓
4. Frontend opens Razorpay checkout modal
   ↓
5. User selects payment method & pays
   ↓
6. Razorpay returns payment response
   ↓
7. Frontend verifies payment signature
   ↓
8. Order created in database
   ↓
9. User redirected to success page
```

---

## 🔐 WEBHOOK HANDLING

### What Are Webhooks?
Razorpay sends webhook events to your server when:
- Payment succeeds
- Payment fails
- Order is paid
- Other payment events occur

### Webhook Endpoint
```
POST /api/webhooks/razorpay
```

### Events Handled
- `payment.authorized` - Payment initiated
- `payment.failed` - Payment failed
- `payment.captured` - Payment captured
- `order.paid` - Order marked as paid

### Setting Up Webhooks in Razorpay Dashboard
1. Go to: Dashboard → Settings → Webhooks
2. **Add Webhook URL:**
   - For testing: Use ngrok or similar (local forwarding)
   - For production: `https://yourdomain.com/api/webhooks/razorpay`
3. **Select Events:**
   - payment.authorized
   - payment.failed
   - payment.captured
   - order.paid
4. **Active:** Enable webhook
5. **Save**

---

## 🚀 MOVE TO LIVE KEYS (PRODUCTION)

### When Ready for Real Payments

1. **Log in** to Razorpay Dashboard
2. **Go to:** Settings → Account Settings
3. **Complete:** Live setup/KYC if needed
4. **Get Live Keys:** Settings → API Keys (switch to Live)
5. **Update .env files:**

**.env.local (Frontend)**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
```

**backend/.env (Backend)**
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET
```

6. **Redeploy:** To Vercel with new keys

---

## 🐛 TROUBLESHOOTING

### Issue: "Razorpay is not loaded"
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh page
- Check browser console for errors

### Issue: "Order creation failed"
**Solution:**
- Verify Razorpay keys are correct
- Check backend logs for errors
- Ensure MongoDB is running

### Issue: "Payment verification failed"
**Solution:**
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check webhook signature validation

### Issue: "Webhook not receiving events"
**Solution:**
- Verify webhook URL is correct
- Use ngrok for local testing
- Check Razorpay dashboard → Webhooks → Logs

### Issue: "Test payment not working"
**Solution:**
- Use correct test card number
- Clear browser cache
- Check browser console errors
- Verify keys are in .env files

---

## 📊 RAZORPAY DASHBOARD FEATURES

### Dashboard Sections

**Payments**
- View all transactions
- Refund payments
- Export reports

**Orders**
- Track order status
- See payment details
- Download invoices

**Customers**
- View customer data
- Track purchase history
- Send communications

**Settings**
- API Keys
- Webhooks
- Payment settings
- Brand customization

**Analytics**
- Transaction reports
- Payment success rate
- Revenue charts

---

## 💰 RAZORPAY PRICING

### Transaction Fees
- **Credit Cards:** 1.99% + GST
- **Debit Cards:** 0.99% + GST
- **UPI:** 0% - 1% + GST
- **Wallets:** 1% - 2% + GST
- **NetBanking:** 0.5% + GST

### Settlement
- **Settlement:** Daily (T+1 basis)
- **Minimum:** ₹0 (no minimum)
- **Account:** Direct to bank account

---

## 🔗 USEFUL LINKS

- **Razorpay Docs:** https://razorpay.com/docs/
- **API Reference:** https://razorpay.com/docs/api/
- **Dashboard:** https://dashboard.razorpay.com/
- **Support:** https://razorpay.com/support/

---

## ✅ CHECKLIST FOR DEPLOYMENT

Before going live:

- [ ] Live Razorpay account created
- [ ] KYC completed
- [ ] Live keys obtained
- [ ] Live keys added to Vercel dashboard
- [ ] Webhook URL configured
- [ ] Test payment successful
- [ ] Error handling tested
- [ ] Email notifications set up
- [ ] Support contact info available
- [ ] Terms & Conditions updated

---

## 🎉 YOU'RE ALL SET!

Your Ewara Cosmetics store now supports:
- ✅ Multiple payment methods
- ✅ Secure payments
- ✅ Instant transaction handling
- ✅ Indian payment preferences
- ✅ Webhook verification

Ready to process real payments! 🚀

