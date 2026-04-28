# PHASE 8 TESTING GUIDE

This guide turns Phase 8 into a runnable verification pass with exact commands, expected evidence, and what is covered automatically versus manually.

## 1. Automated Checks

Run these from the project root:

```powershell
cd backend
npm test
npm run test:integrity
```

What this covers:

- Backend controller/unit verification for auth, address, coupon, admin, review, promo, and order flows
- Order scenarios for:
  - COD order creation
  - Razorpay paid order creation
  - Coupon application and usage increment
  - Razorpay signature failure
  - Payment failure notification email
  - Payment status failure email
  - Stock restoration on cancellation
- MongoDB integrity checks for:
  - `products`, `orders`, `cartitems`, `wishlistitems`
  - missing required order fields
  - duplicate `orders._id`
  - duplicate `cartitems (userId + productId)`
  - duplicate `wishlistitems (userId + productId)`
  - duplicate coupon codes

If `npm run test:integrity` reports legacy orders missing `paymentStatus`, inspect and optionally repair them with:

```powershell
cd backend
npm run backfill:payment-status
node scripts/backfill-order-payment-status.js --apply
```

## 2. Manual E2E Checkout

Preconditions:

- Frontend and backend are running
- Razorpay test keys are configured
- SMTP/email credentials are configured if email delivery must be validated
- At least 3 published products are in stock
- One active coupon exists if coupon flow must be tested

Suggested test data:

- User email: `phase8-checkout@example.com`
- Test card: use Razorpay’s official test-mode card in your own dashboard/test docs
- Qty mix: 1 + 1 + 1 across three different products

Pass criteria:

1. Register a fresh user.
2. Add an address from `/profile`.
3. Browse `/shop` or a product page and add 3 items.
4. Confirm cart quantities and totals.
5. Open checkout and select the saved address.
6. Apply a valid coupon if one is available.
7. Choose Razorpay.
8. Complete payment in test mode.
9. Confirm redirect to `/order-success/[id]`.
10. Confirm the order appears in `/orders`.
11. Confirm the order appears in `/admin/orders`.
12. Confirm the product stock decreased in admin or MongoDB.
13. Confirm order confirmation and payment emails are received.

If any step fails, capture:

- URL
- user email used
- exact action taken
- browser console error
- backend terminal error
- screenshot

## 3. Mobile Responsiveness

Use Chrome DevTools device emulation with these widths:

- `360px` Android
- `375px` iPhone 12
- `768px` iPad
- `1440px` desktop

Pages to verify:

- `/`
- `/shop`
- `/product/[id]`
- `/cart`
- checkout modal
- `/orders`
- `/admin`

Pass criteria:

- No horizontal page scroll
- Primary buttons remain visible and tappable
- Product images render without distortion
- Checkout modal fits the viewport
- Admin tables/cards remain readable
- Form fields stay usable without overlap

## 4. Payment Failure/Cancel Scenarios

Manual scenarios still required:

1. Failed Razorpay payment
   Expected:
   order is not created, stock does not reduce, customer sees an error
2. Cancelled Razorpay checkout
   Expected:
   order is not created, user can retry, stock does not reduce
3. Insufficient funds / declined test card
   Expected:
   Razorpay blocks capture, order is not created
4. COD checkout
   Expected:
   `paymentStatus = Pending`, shipping charge added, order email sent

## 5. Concurrent Testing

Run 5 sessions in parallel for 10-15 minutes:

- Session A: browse shop and product pages
- Session B: add items and complete Razorpay checkout
- Session C: update cart quantities repeatedly
- Session D: place COD order
- Session E: add/remove wishlist items

Monitor:

- frontend console
- backend server logs
- MongoDB counts before and after

Pass criteria:

- no frontend crashes
- no backend `500` errors
- no cross-user data leakage
- stock remains consistent
- all created orders are visible and isolated to the correct user
