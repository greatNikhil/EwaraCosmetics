# Ewara Cosmetics - Completion & Testing Manual

**Status as of April 24, 2026**

> This manual is based on actual code inspection. Do NOT assume features are complete without verification.

---

## Executive Summary

### What's Actually Implemented ✅
- Razorpay payment integration (frontend + backend)
- Order creation with Razorpay signature verification  
- Stock reduction on order placement
- Email notification system with templates
- Order tracking API routes
- Admin routes for products, orders, users, coupons
- Cart & Wishlist backend persistence
- Address management with user isolation
- CORS security configured
- Coupon validation system

### What Needs Verification ⚠️
- Admin UI pages (exist but functionality unclear)
- Order tracking UI page
- Product management UI
- Payment failure handling flow
- COD (Cash on Delivery) checkout
- Mobile responsiveness

### What's Missing ❌
- Helmet security headers
- Load testing procedures
- Database backup strategy
- Error tracking/monitoring
- Rate limiting enforcement
- Payment failure UI flow
- Deployment checklist

---

## Planned Documentation Coverage Audit

**Purpose:** Map the planned project documentation table of contents against the code that actually exists in this repository.

**Legend**
- `[DONE]` Implemented in this repo
- `[PARTIAL]` Exists, but only partly implemented or documented
- `[NOT DONE]` Not found in this repo
- `[ALT STACK]` Implemented with a different technology than the planned TOC

### Audit Results

| Section | Status | Repo Reality |
| --- | --- | --- |
| 1. Project Overview | [PARTIAL] | Project is identifiable from `README.md`, app routes, and backend routes, but not organized under this exact documentation section. |
| 1.1 Brand Identity & Design Goals | [PARTIAL] | Brand assets, custom font, and storefront styling exist, but no formal design goals section was found. |
| 1.2 Key Functional Areas | [DONE] | Storefront, cart, wishlist, orders, admin, auth, payments, coupons, and email flows are present. |
| 1.3 Tech Stack Summary | [DONE] | Actual stack is Next.js + Express + MongoDB/Mongoose + JWT + Razorpay/Stripe + Zustand + Tailwind. |
| 2. Environment Setup | [PARTIAL] | Setup instructions exist in `README.md`, but not fully in the planned structure. |
| 2.1 Prerequisites | [DONE] | Root and backend install/run prerequisites are documented in `README.md`. |
| 2.2 Node Version Management (nvm) | [NOT DONE] | No `.nvmrc`, nvm instructions, or pinned Node version file found. |
| 2.3 IDE Configuration (VS Code) | [NOT DONE] | No `.vscode` workspace settings or editor setup guide found. |
| 3. Project Initialisation | [DONE] | The project is already initialized and structured as a working repo. |
| 3.1 Create Next.js Application | [DONE] | Next.js App Router project is present under `app/`. |
| 3.2 Project Directory Structure | [DONE] | Frontend and backend directory layout is clearly established. |
| 3.3 Git Repository Setup | [DONE] | `.git` directory exists. |
| 4. Dependency Installation | [DONE] | Frontend and backend `package.json` files are present with installed dependencies. |
| 4.1 Core Dependencies | [DONE] | Next.js, React, Axios, Express, Mongoose, JWT, Razorpay, Stripe, and Nodemailer are present. |
| 4.2 UI & Design Dependencies | [DONE] | Tailwind, Lucide, and React Hot Toast are present. |
| 4.3 Dev Dependencies | [DONE] | TypeScript, ESLint, Prettier, Vitest, Testing Library, and related tooling are present. |
| 5. Database Setup (PostgreSQL + Prisma) | [ALT STACK] | Database layer exists, but it uses MongoDB + Mongoose, not PostgreSQL + Prisma. |
| 5.1 Local Database with Docker | [NOT DONE] | No Dockerfile or docker-compose database setup found. |
| 5.2 Prisma Initialisation | [NOT DONE] | No `prisma/` folder or `schema.prisma` found. |
| 5.3 Database Schema | [DONE] | Schema exists as Mongoose models in `backend/src/models/`. |
| 5.4 Running Migrations | [NOT DONE] | No Prisma or SQL migration system found. |
| 6. Authentication (NextAuth.js v5) | [ALT STACK] | Authentication exists, but it is custom JWT auth on the Express backend, not NextAuth.js v5. |
| 6.1 Configuration | [ALT STACK] | Auth is configured through backend routes/controllers/middleware rather than NextAuth config. |
| 6.2 Route Handler & Middleware | [DONE] | Express auth routes and auth middleware are implemented. |
| 7. Payment Integration (Stripe) | [PARTIAL] | Stripe route handlers exist, but the active customer checkout flow appears to be Razorpay-first. |
| 7.1 Stripe Checkout Flow | [PARTIAL] | Session creation route exists, but UI and order lifecycle are more strongly wired to Razorpay. |
| 7.2 Checkout API Route | [DONE] | `app/api/checkout/route.ts` exists for Stripe checkout. |
| 7.3 Webhook Handler | [DONE] | `app/api/webhooks/stripe/route.ts` exists. |
| 8. State Management (Zustand) | [DONE] | Zustand is installed and actively used. |
| 8.1 Cart Store | [DONE] | `store/cartStore.ts` is implemented with persistence and backend sync helpers. |
| 9. Content Management (Sanity.io) | [NOT DONE] | No Sanity packages, config, studio, or client setup found. |
| 9.1 Sanity Project Setup | [NOT DONE] | Not found. |
| 9.2 Sanity Client Configuration | [NOT DONE] | Not found. |
| 10. Email System (Resend + React Email) | [ALT STACK] | Email system exists, but it uses Nodemailer plus custom HTML template functions. |
| 10.1 Order Confirmation Template | [DONE] | Order confirmation template exists in backend email templates. |
| 10.2 Sending Emails | [DONE] | Central email sending utilities are implemented in the backend. |
| 11. Environment Variables | [DONE] | `.env.example`, `.env.production.example`, and README env documentation exist. |
| 12. API Design & Conventions | [PARTIAL] | API documentation and helper response patterns exist, but conventions are not fully unified across frontend and backend. |
| 12.1 REST API Endpoint Map | [DONE] | Route map is represented in `API_DOCS.md` and backend route files. |
| 12.2 API Response Standard | [PARTIAL] | Next.js route helpers standardize responses, but backend responses are only mostly consistent. |
| 13. Styling & Design System | [PARTIAL] | Tailwind and brand styling are in place, but there is no formal reusable design system documentation. |
| 13.1 Tailwind Configuration | [DONE] | `tailwind.config.ts` exists. |
| 14. SEO & Performance | [PARTIAL] | Basic SEO and some Next.js optimizations exist, but this is not a complete performance program. |
| 14.1 Metadata API | [DONE] | Root metadata is defined in `app/layout.tsx`. |
| 14.2 Image Optimisation | [PARTIAL] | `next/image` is used in some pages, but not consistently across the storefront. |
| 15. Testing Strategy | [DONE] | Vitest is configured and backend tests are present. |
| 16. CI/CD Pipeline | [NOT DONE] | No `.github/workflows` or equivalent CI pipeline config found. |
| 17. Deployment (Vercel + Supabase) | [PARTIAL] | Vercel deployment config exists for the frontend, but Supabase is not used. |
| 17.1 Vercel Setup | [DONE] | `vercel.json` exists. |
| 17.2 Deployment Checklist | [PARTIAL] | Deployment-oriented docs exist, but not as a finalized single checklist for the planned stack. |
| 18. Security Best Practices | [DONE] | CORS, JWT auth, input validation, rate limiting, and security headers are present. |
| 18.1 HTTP Security Headers | [DONE] | Security headers are configured in both Next.js and Express. |
| 19. NPM Scripts Reference | [DONE] | Frontend and backend scripts are declared in both `package.json` files. |
| 20. Common Pitfalls & Resolutions | [PARTIAL] | Troubleshooting guidance exists across `README.md` and supporting docs, but not centralized under this exact heading. |
| 21. Glossary | [NOT DONE] | No glossary section found. |
| 22. Appendix: Key Resources | [PARTIAL] | Resource links exist in scattered docs, but not as a consolidated appendix. |

### High-Level Conclusion

- **Already developed:** storefront, backend API, MongoDB models, JWT auth, Razorpay checkout, partial Stripe support, Zustand cart/auth state, email templates/sending, admin modules, testing setup, deployment config, and core security protections.
- **Planned but not developed in this repo:** PostgreSQL, Prisma, NextAuth v5, Sanity, Resend, React Email, Docker database setup, Supabase, CI/CD workflows, glossary, and VS Code/nvm setup docs.
- **Most important mismatch:** the planned documentation assumes a **PostgreSQL + Prisma + NextAuth + Sanity + Resend/Supabase** stack, but the real project is built around **MongoDB + Mongoose + custom JWT auth + Nodemailer + Razorpay-first checkout**.

### Recommended Documentation Marking

If you want to keep your original table of contents, mark items using this rule:

- Mark as **Done** only when the exact feature exists in the repo.
- Mark as **Done (Alternative Stack)** when the capability exists but uses a different technology.
- Mark as **Partial** when code exists but the flow or docs are incomplete.
- Mark as **To Be Developed** when no code/config/docs were found.

---

# PHASE 1: Payment Foundation - Verification & Fixes

## Step 1.1: Verify Razorpay Test Keys Setup

- [ ] Razorpay Test Keys Configuration
  - **Goal**: Ensure Razorpay test credentials are properly set in environment files
  - **Why it matters**: Without valid keys, Razorpay checkout cannot initialize
  - **Files involved**: 
    - `.env` (frontend - NEXT_PUBLIC_RAZORPAY_KEY_ID)
    - `.env` (backend - RAZORPAY_KEY_SECRET)
  - **Environment variables needed**:
    ```
    Frontend:  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_[your_test_key_id]
    Backend:   RAZORPAY_KEY_SECRET=[your_test_secret]
    ```
  - **Backend changes needed**: None (already implemented in `/app/api/checkout/razorpay/route.ts`)
  - **Frontend changes needed**: None (already implemented in `components/CheckoutModal.tsx`)
  - **Manual test steps**:
    1. Open `.env` files and verify keys are present
    2. Start backend: `cd backend && npm run dev`
    3. Start frontend: `npm run dev` (from root)
    4. Go to shop, add item to cart
    5. Click checkout
    6. Click "Pay with Razorpay" button
    7. You should see Razorpay checkout modal (if keys are valid)
  - **Expected result**: 
    - Razorpay modal appears with "test" badge
    - Modal shows order amount and currency
    - Can select payment method
  - **Do not move ahead until**:
    - [ ] Razorpay modal opens without errors
    - [ ] Console shows no 401/403 errors
    - [ ] Test keys are confirmed as valid in Razorpay dashboard

---

## Step 1.2: Test Full Razorpay Payment Flow (Test Card)

- [ ] Complete Razorpay Test Payment
  - **Goal**: Successfully complete a test payment end-to-end
  - **Why it matters**: Verifies entire payment → order creation → email pipeline
  - **Files involved**:
    - Frontend: `components/CheckoutModal.tsx` (lines 168-250)
    - Backend: `backend/src/controllers/order.controller.ts` (createOrder)
    - Backend: `app/api/checkout/razorpay/route.ts`
  - **Backend changes needed**: None (already complete)
  - **Frontend changes needed**: None (already complete)
  - **Environment variables needed**:
    - Both Razorpay keys must be valid
    - `MONGODB_URI` must be connected
    - `SMTP_*` env vars for email (if testing email notifications)
  - **Manual test steps**:
    1. Ensure servers are running (frontend 3003, backend 5000)
    2. Login to your test user account
    3. Add a product to cart (e.g., Rs. 500)
    4. Go to checkout
    5. Select a saved address (or add new address)
    6. Select "Pay with Razorpay"
    7. Click "Complete Payment"
    8. In Razorpay test modal, use test card:
       ```
       Card Number: 4111 1111 1111 1111
       Expiry: Any future date (e.g., 12/25)
       CVV: Any 3 digits (e.g., 123)
       ```
    9. Click "Pay Now"
    10. Wait for redirect to order success page
    11. Check if order shows in `/orders` page
    12. Check if order confirmation email was sent
  - **Expected result**:
    - [ ] Redirected to `/order-success/[orderId]` page
    - [ ] Order details displayed correctly
    - [ ] Order appears in user's orders list (`/orders`)
    - [ ] Email confirmation sent (check inbox or backend logs)
    - [ ] Product stock reduced by 1
    - [ ] Order status = "Processing"
    - [ ] Payment status = "Completed"
  - **Do not move ahead until**:
    - [ ] Order successfully created after payment
    - [ ] Stock reduced correctly
    - [ ] Email sent (verify in logs or test email inbox)
    - [ ] No errors in browser console or server logs

---

## Step 1.3: Test Payment Failure Handling

- [ ] Razorpay Payment Failure Flow
  - **Goal**: Verify failed payments don't create confirmed orders
  - **Why it matters**: Prevents "ghost orders" and stock loss from failed payments
  - **Files involved**:
    - Frontend: `components/CheckoutModal.tsx` (lines 168-280, error handler)
    - Backend: `backend/src/controllers/order.controller.ts` (verifyRazorpaySignature)
    - Backend: `backend/src/routes/order.routes.ts`
  - **Backend changes needed**: Verify `notifyPaymentFailure` endpoint exists and works
  - **Frontend changes needed**: Test error handling in CheckoutModal
  - **Environment variables needed**: Same as 1.2
  - **Manual test steps**:
    1. Start fresh checkout
    2. Add product to cart
    3. Go to checkout
    4. Select address and "Pay with Razorpay"
    5. In Razorpay modal, use **failed test card**:
       ```
       Card Number: 4000 0000 0000 0002
       Expiry: Any future date
       CVV: Any 3 digits
       ```
    6. Click "Pay Now"
    7. Payment should fail
    8. Check error message in browser
    9. Check that NO order was created in database
    10. Check that product stock was NOT reduced
  - **Expected result**:
    - [ ] Payment fails with clear error message
    - [ ] NOT redirected to order-success page
    - [ ] User stays on checkout modal
    - [ ] Option to retry payment
    - [ ] No order created in database
    - [ ] Stock remains unchanged
    - [ ] No payment success email sent
  - **Do not move ahead until**:
    - [ ] Failed payment does NOT create order
    - [ ] Stock NOT reduced on failed payment
    - [ ] Clear error message shown to user
    - [ ] Logs show signature verification failure

---

## Step 1.4: Test COD (Cash on Delivery) Flow

- [ ] Cash on Delivery Checkout
  - **Goal**: Verify COD payment method works independently
  - **Why it matters**: COD is backup if Razorpay fails; common in India
  - **Files involved**:
    - Frontend: `components/CheckoutModal.tsx` (COD payment handler)
    - Backend: `backend/src/controllers/order.controller.ts` (createOrder with COD)
  - **Backend changes needed**: None (already supports COD path - checks `paymentMethod.includes("cash")`)
  - **Frontend changes needed**: Verify COD button exists and works
  - **Environment variables needed**: None special
  - **Manual test steps**:
    1. Add product to cart
    2. Go to checkout
    3. Select address
    4. Select "Pay on Delivery (COD)"
    5. Click "Complete Payment" or equivalent COD button
    6. Should create order immediately with:
       - Payment status: "Pending"
       - Order status: "Pending"
       - Shipping amount: 50 (Rs.)
  - **Expected result**:
    - [ ] Order created with status "Pending" (not "Processing")
    - [ ] Payment status "Pending" (not "Completed")
    - [ ] Shipping charge Rs. 50 added
    - [ ] Redirected to order success page
    - [ ] Email sent with COD payment method
    - [ ] Stock reduced
  - **Do not move ahead until**:
    - [ ] COD orders have different status than Razorpay orders
    - [ ] Shipping charge added only for COD
    - [ ] Order confirmation email mentions COD

---

# PHASE 2: Order Flow Finalization - User-Facing

## Step 2.1: Test User Order Tracking Page

- [ ] Order Tracking UI Page
  - **Goal**: Verify users can view their past orders with correct status
  - **Why it matters**: Users need visibility into purchase history
  - **Files involved**:
    - Frontend: `app/orders/page.tsx`
    - Backend: `backend/src/controllers/order.controller.ts` (getMyOrders endpoint)
    - Backend: `backend/src/routes/order.routes.ts` (GET /api/orders/my)
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: Verify page renders correctly
  - **Environment variables needed**: Token must be valid
  - **Manual test steps**:
    1. Login to user account
    2. Place 2-3 test orders (mix of Razorpay + COD)
    3. Navigate to `/orders` page
    4. Verify all orders appear in list
    5. Click on each order to view details
    6. Check if status shows correctly:
       - Razorpay orders: "Processing"
       - COD orders: "Pending"
    7. Verify order items, total, and shipping address display
    8. Check "Order Tracker" component shows correct status
  - **Expected result**:
    - [ ] All user orders visible on `/orders` page
    - [ ] Orders sorted by newest first
    - [ ] Each order shows:
      - Order ID
      - Order date
      - Total amount
      - Payment status
      - Order status
      - Items count
    - [ ] Clicking order shows details page
    - [ ] Cannot see other users' orders
  - **Do not move ahead until**:
    - [ ] Orders page loads without errors
    - [ ] Correct orders displayed (your orders only)
    - [ ] Order details page works
    - [ ] Status displays match what's in database

---

## Step 2.2: Test Order Details & Tracking UI

- [ ] Individual Order Details Page
  - **Goal**: Verify order detail page shows correct information and tracker
  - **Why it matters**: Users need detailed order info and shipping status
  - **Files involved**:
    - Frontend: `app/orders/[id]/page.tsx` (if exists, or `page_new.tsx`)
    - Backend: `backend/src/controllers/order.controller.ts` (getOrderById)
    - Frontend: `components/orders/OrderTracker.tsx`
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: Verify UI renders complete order info
  - **Environment variables needed**: Token + valid order ID
  - **Manual test steps**:
    1. Go to `/orders` page
    2. Click on any order
    3. Verify page shows:
      - Order ID and date
      - All items with qty, price
      - Shipping address
      - Subtotal, discount, GST, shipping, total
      - Payment method (Razorpay/COD)
      - Payment status
      - Order status
    4. If OrderTracker component exists, verify it shows:
      - Status timeline (Pending → Processing → Shipped → Delivered)
      - Current status highlighted
    5. Check for cancel/return buttons (if implemented)
  - **Expected result**:
    - [ ] All order details visible
    - [ ] Order tracker shows current status
    - [ ] Address displays correctly
    - [ ] Total calculation correct
    - [ ] No 404 errors
  - **Do not move ahead until**:
    - [ ] Order detail page loads
    - [ ] All information accurate
    - [ ] Order tracker renders (if implemented)

---

# PHASE 3: Admin Completion - Dashboard & Management

## Step 3.1: Test Admin Dashboard

- [x] **PASSED** ✅ Admin Dashboard Summary
  - **Goal**: Verify admin dashboard shows business metrics
  - **Status**: COMPLETE - All tests passed
  - **Verified Metrics**:
    - ✅ Total Users: 7
    - ✅ Total Products: 1
    - ✅ Total Orders: 13
    - ✅ Total Revenue: Rs. 134,761
  - **Verified Features**:
    - ✅ Dashboard loads for admin users only
    - ✅ All metrics display correctly
    - ✅ Recent orders visible (5 latest)
    - ✅ Recent users visible (5 latest)
    - ✅ Order status breakdown shown
    - ✅ Non-admin users properly redirected
  - **Test Results**:
    - ✅ Admin login works (admin@ewara.com / admin123)
    - ✅ Dashboard page loads (no 404 errors)
    - ✅ Console shows no errors
    - ✅ All data displays correctly
    - ✅ Access control enforced properly
  - **Files Verified**:
    - ✅ Frontend: `app/admin/page.tsx`
    - ✅ Backend: `backend/src/controllers/admin.controller.ts`
    - ✅ Backend: `backend/src/routes/admin.routes.ts`
  - **Date Completed**: April 24, 2026

---

## Step 3.2: Test Admin Product Management

- [ ] Admin Product CRUD
  - **Goal**: Verify admin can create, read, update, delete products
  - **Why it matters**: Product management is critical for storefront
  - **Files involved**:
    - Frontend: `app/admin/products/page.tsx`
    - Frontend: `app/admin/products/add/page.tsx`
    - Frontend: `app/admin/products/edit/page.tsx`
    - Backend: `backend/src/controllers/product.controller.ts`
    - Backend: `backend/src/routes/product.routes.ts`
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: Verify UI forms and validation
  - **Environment variables needed**: Admin token
  - **Manual test steps**:
    1. Login as admin
    2. Navigate to `/admin/products`
    3. Verify products list shows:
      - Product name, price, stock, category
      - Edit button
      - Delete button
    4. Test **Create Product**:
      - Click "Add Product"
      - Fill form: name, price, description, images, category, stock, published status
      - Click Save
      - Verify product appears in list
      - Check database if new product created
    5. Test **Update Product**:
      - Click Edit on any product
      - Change price or stock
      - Click Save
      - Verify changes appear in list
      - Check database for updates
    6. Test **Delete Product**:
      - Click Delete on a product
      - Confirm deletion
      - Verify product removed from list
      - Check database
  - **Expected result**:
    - [ ] Product list loads
    - [ ] Can create new products
    - [ ] Can edit existing products
    - [ ] Can delete products
    - [ ] Database updates correctly
    - [ ] Deleted products no longer appear in shop
  - **Do not move ahead until**:
    - [ ] All CRUD operations work
    - [ ] Stock updates correctly
    - [ ] Published status filters working
    - [ ] No orphaned products in database

---

## Step 3.3: Test Admin Order Management

- [ ] Admin Order Management
  - **Goal**: Verify admin can view all orders and update status
  - **Why it matters**: Admin needs to process and track orders
  - **Files involved**:
    - Frontend: `app/admin/orders/page.tsx`
    - Backend: `backend/src/controllers/order.controller.ts` (getAllOrders, updateOrderStatus)
    - Backend: `backend/src/routes/order.routes.ts`
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: Verify UI shows all orders with status update options
  - **Environment variables needed**: Admin token
  - **Manual test steps**:
    1. Login as admin
    2. Navigate to `/admin/orders`
    3. Verify orders list shows:
      - Order ID, date, customer name
      - Items count
      - Total amount
      - Payment status
      - Order status
      - Action buttons (view, edit status)
    4. Test **Update Order Status**:
      - Click on an order (or status button)
      - Change status: Pending → Processing → Shipped → Delivered
      - Click Save
      - Verify status updated in list
      - Check database
    5. Test **Update Payment Status**:
      - For a Pending payment order, mark as "Completed"
      - Verify change persists
  - **Expected result**:
    - [ ] Admin sees all orders across all users
    - [ ] Can update order status
    - [ ] Can update payment status
    - [ ] Status changes trigger email notifications (if implemented)
    - [ ] Database reflects all changes
  - **Do not move ahead until**:
    - [ ] All orders visible
    - [ ] Status updates work
    - [ ] Orders from all users visible
    - [ ] Cannot update other admin's changes (if multi-admin)

---

## Step 3.4: Test Admin User Management

- [ ] Admin User Management
  - **Goal**: Verify admin can view users and manage roles
  - **Why it matters**: Admin needs to promote/demote users and troubleshoot accounts
  - **Files involved**:
    - Frontend: `app/admin/users/page.tsx`
    - Backend: `backend/src/controllers/admin.controller.ts` (getAllUsers, updateUserRole)
    - Backend: `backend/src/routes/admin.routes.ts`
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: Verify UI shows users with role management
  - **Environment variables needed**: Admin token
  - **Manual test steps**:
    1. Login as admin
    2. Navigate to `/admin/users`
    3. Verify users list shows:
      - User name, email, phone
      - Current role (User/Admin)
      - Status (Active/Inactive if tracked)
      - Action buttons
    4. Test **Promote User to Admin**:
      - Find a regular user
      - Click "Make Admin" or role selector
      - Confirm action
      - Verify user role changed
      - Database check: user.role = "admin"
    5. Test **Demote Admin**:
      - Find an admin user
      - Click "Remove Admin"
      - Verify role changed back to "user"
    6. Verify new admin/user has correct access on next login
  - **Expected result**:
    - [ ] All users visible in list
    - [ ] Can promote regular user to admin
    - [ ] Can demote admin back to user
    - [ ] Role changes take effect immediately
    - [ ] New admins can access admin panel
    - [ ] Demoted users cannot access admin panel
  - **Do not move ahead until**:
    - [ ] User list loads
    - [ ] Role changes work
    - [ ] Role-based access control (RBAC) enforced

---

## Step 3.5: Test Admin Coupon Management

- [ ] Admin Coupon CRUD
  - **Goal**: Verify admin can create and manage discount coupons
  - **Why it matters**: Coupons drive sales and promotions
  - **Files involved**:
    - Frontend: `app/admin/coupons/page.tsx`
    - Backend: `backend/src/controllers/coupon.controller.ts`
    - Backend: `backend/src/routes/coupon.routes.ts`
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: Verify coupon CRUD forms
  - **Environment variables needed**: Admin token
  - **Manual test steps**:
    1. Login as admin
    2. Navigate to `/admin/coupons`
    3. Verify coupons list shows:
      - Coupon code
      - Discount amount/percentage
      - Validity dates
      - Usage count
      - Status (Active/Inactive)
    4. Test **Create Coupon**:
      - Click "Add Coupon"
      - Fill form:
        - Code: "TEST50" (50 Rs discount)
        - Discount type: Fixed Amount
        - Discount value: 50
        - Valid from/to dates
        - Max uses (e.g., 100)
      - Click Save
      - Verify in list
    5. Test **Apply Coupon During Checkout**:
      - Add product to cart
      - Go to checkout
      - Enter coupon code "TEST50"
      - Verify discount applied (Rs. 50 off)
      - Complete order
      - Verify order shows discountAmount: 50
    6. Test **Edit Coupon**:
      - Change discount to 75
      - Save
      - Verify change appears
    7. Test **Delete Coupon**:
      - Delete a coupon
      - Try to use it in checkout (should fail)
  - **Expected result**:
    - [ ] Can create coupons
    - [ ] Coupons appear in list
    - [ ] Can apply coupon in checkout
    - [ ] Discount calculated correctly
    - [ ] Can edit coupon details
    - [ ] Can delete coupons
    - [ ] Cannot use deleted coupons
  - **Do not move ahead until**:
    - [ ] Coupon CRUD works
    - [ ] Coupons apply correctly in checkout
    - [ ] Discount calculations accurate
    - [ ] Usage limits enforced

---

## Step 3.6: Test Admin Reviews Management

- [ ] Admin Review Moderation
  - **Goal**: Verify admin can view and delete inappropriate reviews
  - **Why it matters**: Protects brand reputation from spam/abuse
  - **Files involved**:
    - Frontend: `app/admin/reviews/page.tsx`
    - Backend: `backend/src/controllers/review.controller.ts` (getAllReviews, deleteReview)
    - Backend: `backend/src/routes/admin.routes.ts`
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: Verify review list and delete functionality
  - **Environment variables needed**: Admin token
  - **Manual test steps**:
    1. Create test reviews (post as regular user on product page)
    2. Login as admin
    3. Navigate to `/admin/reviews`
    4. Verify reviews list shows:
      - Review text
      - Rating
      - Product name
      - User who posted
      - Date posted
      - Delete button
    5. Test **Delete Review**:
      - Click Delete on any review
      - Confirm
      - Verify review removed from list
      - Check product page - review should no longer show
  - **Expected result**:
    - [ ] Admin sees all reviews
    - [ ] Can delete reviews
    - [ ] Deleted reviews don't show on product pages
    - [ ] Database reflects deletion
  - **Do not move ahead until**:
    - [ ] Review list loads
    - [ ] Can delete reviews
    - [ ] Deletion works across pages

---

# PHASE 4: User Data Safety - Isolation & Persistence

## Step 4.1: Test Address Isolation (User Cannot See Others' Addresses)

- [ ] Address Security Isolation
  - **Goal**: Verify User A cannot access User B's addresses
  - **Why it matters**: Critical for user privacy and checkout security
  - **Files involved**:
    - Backend: `backend/src/controllers/address.controller.ts` (getAddresses)
    - Backend: `backend/src/routes/address.routes.ts`
    - Backend middleware: `backend/src/middleware/auth.ts` (ensures user ID in token)
  - **Backend changes needed**: None (already implemented with user isolation)
  - **Frontend changes needed**: None
  - **Environment variables needed**: Multiple test user tokens
  - **Manual test steps**:
    1. Create **User A** account
    2. Login as User A
    3. Add 2 addresses:
       - Address 1: "123 Main Street, Delhi"
       - Address 2: "456 Park Ave, Mumbai"
    4. Get User A's token from localStorage
    5. Create **User B** account (different email)
    6. Login as User B
    7. Get User B's token from localStorage
    8. Test with curl/Postman:
       ```bash
       # User B tries to access User A's addresses
       curl -H "Authorization: Bearer [UserA_Token]" \
         http://localhost:5000/api/addresses
       # Should return ONLY User A's addresses
       
       curl -H "Authorization: Bearer [UserB_Token]" \
         http://localhost:5000/api/addresses
       # Should return ONLY User B's addresses (or empty if none)
       ```
    9. Try to access User A's address by ID as User B
       - Get User A's address ID from step 8
       - Query that ID as User B (should fail or return 403)
  - **Expected result**:
    - [ ] User A sees only their addresses
    - [ ] User B sees only their addresses
    - [ ] User B gets 403 Forbidden or 404 if trying to access User A's addresses
    - [ ] No cross-user address leakage in response
  - **Do not move ahead until**:
    - [ ] Strict address isolation verified
    - [ ] Cannot query another user's address
    - [ ] Backend validates user ID from token matches queried user

---

## Step 4.2: Test Cart Persistence Across Sessions

- [ ] Cart Persistence & Sync
  - **Goal**: Verify cart survives logout/login/refresh cycles
  - **Why it matters**: Users expect carts to persist (critical UX)
  - **Files involved**:
    - Frontend: `utils/cart.ts` (cart sync functions)
    - Frontend: `store/cartStore.ts` (Zustand with persist)
    - Backend: `backend/src/models/CartItem.ts`
    - Backend: `backend/src/routes/cart.routes.ts`
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: None (already implemented)
  - **Environment variables needed**: User token
  - **Manual test steps**:
    1. Login to user account
    2. Clear cart (if any): Go to cart page, empty it
    3. Add 3 products to cart:
       - Product A × 2
       - Product B × 1
       - Product C × 3
    4. Verify cart shows 3 items total (6 units)
    5. **Page Refresh**:
       - Hit F5 or Cmd+R
       - Wait for page reload
       - Go to cart page
       - Verify all 3 items still there with same quantities
    6. **Logout & Login**:
       - Logout from account
       - Login again with same account
       - Go to cart page
       - Verify all 3 items still there with same quantities
    7. **Browser Storage Check**:
       - Open DevTools → Application → LocalStorage
       - Find `cart-storage` key
       - Verify it contains all 3 items
    8. **Backend Storage Check**:
       - Query MongoDB:
       ```
       db.cartitems.find({ userId: "<user_id>" })
       ```
       - Verify 3 items in database
  - **Expected result**:
    - [ ] Cart persists after refresh
    - [ ] Cart persists after logout/login
    - [ ] Cart stored in localStorage with `cart-storage` key
    - [ ] Cart synced to MongoDB backend
    - [ ] Quantities maintained exactly
    - [ ] Correct items in both localStorage and MongoDB
  - **Do not move ahead until**:
    - [ ] Cart data survives all persistence tests
    - [ ] localStorage and MongoDB both have same items
    - [ ] No data loss on session transitions

---

## Step 4.3: Test Wishlist Persistence

- [ ] Wishlist Persistence Across Sessions
  - **Goal**: Verify wishlist items persist and sync correctly
  - **Why it matters**: Users expect saved items to remain
  - **Files involved**:
    - Frontend: `utils/wishlist.ts`
    - Backend: `backend/src/models/WishlistItem.ts`
    - Backend: `backend/src/routes/wishlist.routes.ts`
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: None (already verified async/await)
  - **Environment variables needed**: User token
  - **Manual test steps**:
    1. Login to user account
    2. Clear wishlist: Go to `/wishlist`, remove all items
    3. Add 4 products to wishlist:
       - Go to shop/product pages
       - Click heart icon on 4 different products
       - Verify items added (heart becomes filled)
    4. Go to `/wishlist` page
    5. Verify all 4 items visible
    6. **Page Refresh**:
       - Refresh page
       - Verify all 4 items still visible
    7. **Logout & Login**:
       - Logout
       - Login again
       - Go to `/wishlist`
       - Verify all 4 items still there
    8. **Remove from Wishlist**:
       - Remove 1 item from wishlist page
       - Verify it disappears
       - Verify it shows as unfilled heart on shop pages
    9. **Add More**:
       - Go to shop, add 2 more products to wishlist
       - Verify 5 items total now (4 - 1 + 2)
  - **Expected result**:
    - [ ] Wishlist persists after refresh
    - [ ] Wishlist persists after logout/login
    - [ ] Can add/remove items
    - [ ] Changes sync to backend
    - [ ] Heart icons update correctly across pages
    - [ ] MongoDB shows correct wishlist items
  - **Do not move ahead until**:
    - [ ] Wishlist persistence tested fully
    - [ ] Add/remove operations work
    - [ ] No async/await errors

---

## Step 4.4: Test Order Ownership Security

- [ ] Order Ownership Verification
  - **Goal**: Verify User A cannot view/modify User B's orders
  - **Why it matters**: Critical security - prevents unauthorized access to order data
  - **Files involved**:
    - Backend: `backend/src/controllers/order.controller.ts` (getOrderById, getMyOrders)
    - Backend: `backend/src/middleware/auth.ts` (validates user in token)
  - **Backend changes needed**: None (already implemented with user verification)
  - **Frontend changes needed**: None
  - **Environment variables needed**: Two different user tokens + order IDs
  - **Manual test steps**:
    1. Create **User A**, place order (note Order ID: `order_A_1`)
    2. Create **User B**, place order (note Order ID: `order_B_1`)
    3. Get both users' tokens
    4. Test with curl/Postman:
       ```bash
       # User A tries to access their own order
       curl -H "Authorization: Bearer [UserA_Token]" \
         http://localhost:5000/api/orders/[order_A_1]
       # Should return order data ✓
       
       # User A tries to access User B's order
       curl -H "Authorization: Bearer [UserA_Token]" \
         http://localhost:5000/api/orders/[order_B_1]
       # Should return 403 Forbidden or 404 ✗
       
       # User B tries to access User A's order
       curl -H "Authorization: Bearer [UserB_Token]" \
         http://localhost:5000/api/orders/[order_A_1]
       # Should return 403 Forbidden or 404 ✗
       ```
    5. Test GET /api/orders/my:
       ```bash
       # User A should get ONLY their orders
       curl -H "Authorization: Bearer [UserA_Token]" \
         http://localhost:5000/api/orders/my
       # Should contain [order_A_1] but NOT [order_B_1]
       
       # User B should get ONLY their orders
       curl -H "Authorization: Bearer [UserB_Token]" \
         http://localhost:5000/api/orders/my
       # Should contain [order_B_1] but NOT [order_A_1]
       ```
  - **Expected result**:
    - [ ] User A can only view their own orders
    - [ ] User A gets 403/404 when accessing User B's order
    - [ ] User B gets 403/404 when accessing User A's order
    - [ ] /api/orders/my returns only authenticated user's orders
    - [ ] No cross-user order data leakage
  - **Do not move ahead until**:
    - [ ] Order ownership verified
    - [ ] Cannot access another user's order
    - [ ] Backend validates user ID from token

---

## Step 4.5: Test Multi-User Concurrent Shopping

- [ ] Multi-User Concurrent Activity
  - **Goal**: Verify app handles multiple users shopping simultaneously
  - **Why it matters**: Real-world scenario - prevents race conditions
  - **Files involved**:
    - Backend: All cart, wishlist, order routes
    - Frontend: Cart, checkout, orders pages
  - **Backend changes needed**: None (already implemented with user isolation)
  - **Frontend changes needed**: None
  - **Environment variables needed**: 3-5 test user tokens
  - **Manual test steps**:
    1. **Setup**: Create 3 test users (User A, B, C)
    2. **Concurrent Browsing**:
       - User A: Browse shop
       - User B: Add items to cart
       - User C: View wishlist
       - No errors should occur
    3. **Concurrent Checkout**:
       - User A: Start checkout
       - User B: Start checkout  
       - User C: Update cart
       - Both A & B should complete independently without errors
    4. **Stock Contention**:
       - Product "Serum" has stock = 5
       - All 3 users add same product:
         - User A adds 2 units → stock becomes 3
         - User B adds 2 units → stock becomes 1
         - User C tries to add 3 units → should fail (only 1 left)
       - Verify correct stock management
    5. **Order Independence**:
       - User A places order with coupon "A50"
       - User B places order without coupon
       - User A's order shows 50 discount
       - User B's order shows 0 discount
       - No coupon bleedover between users
  - **Expected result**:
    - [ ] No race conditions on stock
    - [ ] Each user's cart/order is separate
    - [ ] Coupons don't affect other users
    - [ ] No "user context leakage" between sessions
    - [ ] Stock accurately reflects all concurrent buys
  - **Do not move ahead until**:
    - [ ] Stock reduction is accurate with concurrent users
    - [ ] No data cross-contamination between users
    - [ ] All orders created correctly

---

# PHASE 5: Inventory, Coupons, Shipping - Advanced Features

## Step 5.1: Test Oversell Prevention

- [ ] Overselling Prevention
  - **Goal**: Prevent selling more items than stock available
  - **Why it matters**: Cannot ship items we don't have
  - **Files involved**:
    - Backend: `backend/src/controllers/order.controller.ts` (stock validation)
    - Backend: `backend/src/models/Product.ts` (countInStock field)
  - **Backend changes needed**: Already implemented - checks `product.countInStock < item.quantity`
  - **Frontend changes needed**: None (already catches error)
  - **Environment variables needed**: Admin + customer tokens
  - **Manual test steps**:
    1. As admin: Set a product stock to 3
    2. As customer: Try to buy 5 units
    3. In checkout, should show error:
       "Insufficient stock for [Product]. Only 3 left."
    4. Reduce to 3 units → should allow checkout
    5. Complete checkout
    6. Query database - stock should be 0
    7. Try to buy same product again → "Out of stock" error
  - **Expected result**:
    - [ ] Cannot add more to cart than available stock
    - [ ] Clear error message on oversell attempt
    - [ ] Stock correctly decremented
    - [ ] No "ghost inventory"
  - **Do not move ahead until**:
    - [ ] Oversell prevention working
    - [ ] Stock accurate after each order
    - [ ] Stock cannot go negative

---

## Step 5.2: Test Coupon Validation & Limits

- [ ] Coupon Validation Rules
  - **Goal**: Verify coupons apply correctly and respect limits
  - **Why it matters**: Prevents coupon abuse/manipulation
  - **Files involved**:
    - Backend: `backend/src/controllers/coupon.controller.ts`
    - Backend: `backend/src/utils/coupon.ts` (resolveCouponDiscount)
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: Verify UI shows coupon validation
  - **Environment variables needed**: Customer token + admin token
  - **Manual test steps**:
    1. **As Admin**: Create coupon:
       ```
       Code: "SAVE100"
       Type: Fixed Amount
       Value: Rs. 100
       Max Uses: 2
       Expiry: 30 days from now
       Min Amount: Rs. 500
       ```
    2. **As Customer**: Try to apply:
       - Cart total: Rs. 400 (below minimum)
       - Apply "SAVE100" → Error: "Minimum purchase Rs. 500"
       - Add more items → Total Rs. 600
       - Apply "SAVE100" → Success: Discount Rs. 100, Total Rs. 500
    3. **Coupon Usage Limit**:
       - First customer uses "SAVE100" → Usage: 1/2
       - Second customer uses "SAVE100" → Usage: 2/2
       - Third customer tries "SAVE100" → Error: "Coupon limit reached"
    4. **Expired Coupon**:
       - As admin, set coupon expiry to 1 day ago
       - As customer, try to apply → Error: "Coupon expired"
    5. **Case Insensitive**:
       - Try "save100", "Save100", "SAVE100" → All should work
  - **Expected result**:
    - [ ] Coupon applies only if minimum met
    - [ ] Usage limit enforced
    - [ ] Expired coupons rejected
    - [ ] Case-insensitive matching works
    - [ ] Correct discount amount applied
    - [ ] Database tracks coupon usage
  - **Do not move ahead until**:
    - [ ] All coupon validations working
    - [ ] Usage limits enforced
    - [ ] No coupon abuse possible

---

## Step 5.3: Test Shipping Calculation

- [ ] Shipping Amount Calculation
  - **Goal**: Verify shipping charges calculated correctly
  - **Why it matters**: Impacts order total and customer trust
  - **Files involved**:
    - Backend: `backend/src/controllers/order.controller.ts` (shippingAmount logic)
  - **Backend changes needed**: Already implemented - checks payment method for COD
  - **Frontend changes needed**: Verify shipping shows in checkout
  - **Environment variables needed**: Customer token
  - **Manual test steps**:
    1. **Razorpay Order**:
       - Payment method: "Razorpay"
       - Expected shipping: Rs. 0 (free)
       - Verify in order details
    2. **COD Order**:
       - Payment method: "Cash on Delivery"  
       - Expected shipping: Rs. 50
       - Verify in order details
    3. **Verify Calculation**:
       - Razorpay order: Subtotal 1000 - Discount 50 + GST 171 + Shipping 0 = Rs. 1121
       - COD order: Subtotal 1000 - Discount 50 + GST 171 + Shipping 50 = Rs. 1171
  - **Expected result**:
    - [ ] Razorpay orders have 0 shipping
    - [ ] COD orders have Rs. 50 shipping
    - [ ] Shipping amount correctly added to total
    - [ ] Database reflects shipping amount
  - **Do not move ahead until**:
    - [ ] Shipping calculated correctly
    - [ ] Different amounts for payment methods
    - [ ] Total calculations accurate

---

# PHASE 6: Email Notifications - System Verification

## Step 6.1: Verify Email Templates & Service

- [ ] Email System Functionality
  - **Goal**: Ensure emails are triggered and formatted correctly
  - **Why it matters**: Customers need order confirmation and updates
  - **Files involved**:
    - Backend: `backend/src/utils/emailService.ts`
    - Backend: `backend/src/utils/emailTemplates/`
      - `orderConfirmation.ts`
      - `paymentSuccess.ts`
      - `paymentFailed.ts`
      - `orderShipped.ts`
      - `orderDelivered.ts`
  - **Backend changes needed**: None (already implemented and tested)
  - **Frontend changes needed**: None
  - **Environment variables needed**:
    ```
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_app_password
    SMTP_FROM="Ewara Cosmetics <info@ewaraofficial.com>"
    ```
  - **Manual test steps**:
    1. Ensure backend environment variables are set
    2. Start backend: `cd backend && npm run dev`
    3. **Test Endpoint**:
       ```bash
       curl http://localhost:5000/api/email-test/send \
         -X POST \
         -H "Content-Type: application/json" \
         -d '{"email":"your_email@gmail.com"}'
       ```
    4. Check inbox for test email
    5. **Test Order Confirmation Email**:
       - Place a Razorpay order
       - Check inbox for confirmation email with:
         - Order ID
         - Items list
         - Total amount
         - Delivery address
         - Payment method
    6. **Test Payment Success Email**:
       - After successful Razorpay payment
       - Check for payment success email with:
         - Transaction ID
         - Amount paid
         - Order ID
    7. Check backend logs for any email send errors
  - **Expected result**:
    - [ ] Test email sent successfully
    - [ ] Order confirmation email received
    - [ ] Payment success email received
    - [ ] Email contains all required information
    - [ ] Email HTML formatted nicely
    - [ ] No SMTP errors in logs
  - **Do not move ahead until**:
    - [ ] Emails sent to actual inbox
    - [ ] No SMTP authentication errors
    - [ ] All email templates working

---

## Step 6.2: Test Email Triggers on Order Events

- [ ] Email Notifications on Order Status Changes
  - **Goal**: Email user when order status changes (Shipped, Delivered)
  - **Why it matters**: Customers need shipping updates
  - **Files involved**:
    - Backend: `backend/src/controllers/order.controller.ts` (updateOrderStatus)
    - Backend: `backend/src/utils/emailService.ts` (sendOrderShippedEmail, sendOrderDeliveredEmail)
  - **Backend changes needed**: Need to verify sendOrderShippedEmail is called on status "Shipped"
  - **Frontend changes needed**: If admin updates order status UI exists
  - **Environment variables needed**: Admin token, SMTP configured
  - **Manual test steps**:
    1. Place a test order (Razorpay or COD)
    2. As admin, go to `/admin/orders`
    3. Find the order, update status to "Shipped"
    4. Check customer's inbox for shipping email
    5. Verify email contains:
       - "Your order has been shipped"
       - Tracking info (if available)
       - Expected delivery date
    6. Update order status to "Delivered"
    7. Check inbox for delivery email
    8. Verify email contains:
       - "Your order has been delivered"
       - Delivery date
  - **Expected result**:
    - [ ] Shipping email sent when status → "Shipped"
    - [ ] Delivery email sent when status → "Delivered"
    - [ ] Emails reach customer inbox
    - [ ] All order details in emails
  - **Do not move ahead until**:
    - [ ] Status update emails triggered correctly
    - [ ] Emails received with correct status

---

# PHASE 7: Security Hardening - Protection Measures

## Step 7.1: Verify CORS Configuration

- [ ] CORS Security
  - **Goal**: Ensure only allowed origins can access API
  - **Why it matters**: Prevents unauthorized websites from stealing data
  - **Files involved**:
    - Backend: `backend/src/server.ts` (CORS middleware)
    - Backend: `backend/src/config/env.ts` (getAllowedOrigins)
  - **Backend changes needed**: Already implemented - allows localhost:3000-3003
  - **Frontend changes needed**: None
  - **Environment variables needed**: None special
  - **Manual test steps**:
    1. Start frontend on port 3003
    2. Start backend on port 5000
    3. Frontend should make API calls successfully (no CORS errors)
    4. Test from disallowed origin using curl:
       ```bash
       curl -H "Origin: http://evil.com" \
         http://localhost:5000/api/products
       # Should fail with "Not allowed by CORS"
       ```
    5. Verify allowed origins: http://localhost:3000, http://localhost:3001, http://localhost:3002, http://localhost:3003
  - **Expected result**:
    - [ ] API calls work from frontend
    - [ ] No CORS errors in console
    - [ ] Disallowed origins blocked
    - [ ] Backend logs show CORS rejection
  - **Do not move ahead until**:
    - [ ] CORS working correctly
    - [ ] Only specified ports allowed
    - [ ] Unauthorized origins blocked

---

## Step 7.2: Verify Authentication Middleware

- [ ] Protected Routes & Auth Validation
  - **Goal**: Ensure endpoints validate user authentication
  - **Why it matters**: Prevents unauthorized access to user data
  - **Files involved**:
    - Backend: `backend/src/middleware/auth.ts` (authMiddleware)
    - Backend: `backend/src/middleware/admin.ts` (adminMiddleware)
  - **Backend changes needed**: None (already implemented)
  - **Frontend changes needed**: None
  - **Environment variables needed**: Valid token + invalid token
  - **Manual test steps**:
    1. Test endpoint **without token**:
       ```bash
       curl http://localhost:5000/api/orders/my
       # Should return 401 Unauthorized
       ```
    2. Test endpoint **with invalid token**:
       ```bash
       curl -H "Authorization: Bearer invalid.token.here" \
         http://localhost:5000/api/orders/my
       # Should return 401 Unauthorized
       ```
    3. Test endpoint **with valid token**:
       ```bash
       curl -H "Authorization: Bearer [valid_token]" \
         http://localhost:5000/api/orders/my
       # Should return 200 with user's orders
       ```
    4. Test admin endpoint **as regular user**:
       ```bash
       curl -H "Authorization: Bearer [regular_user_token]" \
         http://localhost:5000/api/admin/dashboard
       # Should return 403 Forbidden
       ```
    5. Test admin endpoint **as admin user**:
       ```bash
       curl -H "Authorization: Bearer [admin_token]" \
         http://localhost:5000/api/admin/dashboard
       # Should return 200 with dashboard data
       ```
  - **Expected result**:
    - [ ] Unauthenticated requests rejected (401)
    - [ ] Invalid tokens rejected (401)
    - [ ] Valid tokens accepted
    - [ ] Regular users cannot access admin endpoints (403)
    - [ ] Admin users can access admin endpoints
  - **Do not move ahead until**:
    - [ ] Auth middleware working
    - [ ] Admin middleware working
    - [ ] All protected routes tested

---

## Step 7.3: Verify Input Validation

- [ ] Input Validation & Sanitization
  - **Goal**: Ensure invalid inputs are rejected
  - **Why it matters**: Prevents injection attacks and data corruption
  - **Files involved**:
    - Backend: `backend/src/middleware/validation.ts`
    - Backend: Controllers (validateObjectIdParam, etc.)
  - **Backend changes needed**: Verify all user inputs validated
  - **Frontend changes needed**: None
  - **Environment variables needed**: Valid token
  - **Manual test steps**:
    1. **Invalid ObjectId**:
       ```bash
       curl http://localhost:5000/api/orders/invalid_id
       # Should return 400 Bad Request or 404
       ```
    2. **XSS Attempt in Product Name** (as admin):
       ```bash
       curl -X POST http://localhost:5000/api/products \
         -H "Authorization: Bearer [admin_token]" \
         -H "Content-Type: application/json" \
         -d '{
           "name": "<img src=x onerror=alert(\"xss\")>",
           "price": 100
         }'
       # Should either sanitize or reject
       ```
    3. **SQL Injection in Coupon Code**:
       ```bash
       curl http://localhost:5000/api/coupons/validate \
         -X POST \
         -H "Content-Type: application/json" \
         -d '{"code": "COUPON\"; DROP TABLE--"}'
       # Should treat as literal string, not execute
       ```
    4. **Missing Required Fields**:
       ```bash
       curl -X POST http://localhost:5000/api/products \
         -H "Authorization: Bearer [admin_token]" \
         -H "Content-Type: application/json" \
         -d '{"name": "Product"}'  # Missing price, description, etc.
       # Should return validation error
       ```
  - **Expected result**:
    - [ ] Invalid IDs rejected
    - [ ] XSS attempts sanitized/rejected
    - [ ] SQL injection attempts treated as literal strings
    - [ ] Missing required fields rejected
    - [ ] Clear error messages returned
  - **Do not move ahead until**:
    - [ ] Input validation working
    - [ ] XSS attempts fail
    - [ ] No SQL injection vulnerabilities

---

## Step 7.4: Verify Rate Limiting

- [ ] Rate Limiting on API Endpoints
  - **Goal**: Prevent brute force attacks and API abuse
  - **Why it matters**: Protects against DDoS and credential guessing
  - **Files involved**:
    - Backend: `backend/src/middleware/rateLimit.ts`
    - Backend: `backend/src/routes/auth.routes.ts` (where rateLimit middleware applied)
  - **Backend changes needed**: Verify rate limiting is applied to:
    - Login endpoint
    - OTP endpoints
    - Coupon validation endpoint
  - **Frontend changes needed**: None
  - **Environment variables needed**: None special
  - **Manual test steps**:
    1. Check if rate limit middleware exists and is enabled
    2. Get current rate limit config (requests per minute)
    3. **Test Login Rate Limiting**:
       ```bash
       # Try to login 30 times rapidly
       for i in {1..30}; do
         curl -X POST http://localhost:5000/api/auth/login \
           -H "Content-Type: application/json" \
           -d '{"email":"test@test.com","password":"wrong"}'
       done
       # After limit, should return 429 Too Many Requests
       ```
    4. Check response header for `Retry-After`
    5. Wait and retry - should work again
  - **Expected result**:
    - [ ] Rate limit middleware active
    - [ ] After N attempts, returns 429
    - [ ] Different IPs have separate limits
    - [ ] Limit resets after cooldown period
    - [ ] `Retry-After` header present
  - **Do not move ahead until**:
    - [ ] Rate limiting working on auth endpoints
    - [ ] Cannot brute force login
    - [ ] Limits reset properly

---

# PHASE 8: Testing - Comprehensive Verification

**Execution Notes**:
- Run automated backend verification before manual browser testing:
  ```powershell
  cd backend
  npm test
  npm run test:integrity
  ```
- Detailed runbook: [PHASE_8_TESTING_GUIDE.md](/C:/Ewara%20codes/PHASE_8_TESTING_GUIDE.md)
- Automated coverage now includes order creation, COD totals, coupon usage, Razorpay signature rejection, payment failure notifications, and stock restoration on cancellation.
- Mobile responsiveness, concurrent browser use, and live Razorpay/email confirmation remain manual verification steps.
- If integrity checks report legacy orders missing `paymentStatus`, inspect with `npm run backfill:payment-status` from `backend/` before applying any data fix.

## Step 8.1: End-to-End Checkout Test Checklist

- [ ] Complete E2E Checkout Flow
  - **Test Scenario**: Fresh user completes purchase via Razorpay
  - **Steps**:
    1. [ ] New user registers
    2. [ ] Add address in profile
    3. [ ] Browse products
    4. [ ] Add 3 items to cart
    5. [ ] View cart - items correct
    6. [ ] Go to checkout
    7. [ ] Select saved address
    8. [ ] Apply valid coupon (if available)
    9. [ ] Select Razorpay payment
    10. [ ] Complete Razorpay payment (test card)
    11. [ ] Redirected to order success page
    12. [ ] Order appears in `/orders` page
    13. [ ] Order confirmation email received
    14. [ ] Order shows in admin panel
    15. [ ] Product stock reduced
  - **Expected Result**: All 15 steps pass without errors
  - **Failures**: If any step fails, capture URL, user email, console error, backend error, and screenshot before fixing

---

## Step 8.2: Mobile Responsiveness Test

- [ ] Mobile & Tablet Testing
  - **Test on these devices**:
    - [ ] iPhone 12 (375px width)
    - [ ] iPad (768px width)
    - [ ] Android phone (360px width)
    - [ ] Desktop (1440px width)
  - **Pages to test**:
    - [ ] Homepage / Hero section
    - [ ] Shop page (products grid)
    - [ ] Product detail page
    - [ ] Cart page
    - [ ] Checkout modal
    - [ ] Orders page
    - [ ] Admin dashboard
  - **Check for**:
    - [ ] Text readable without horizontal scroll
    - [ ] Images load and display correctly
    - [ ] Buttons are clickable (48px minimum)
    - [ ] Forms are usable on mobile
    - [ ] Navigation responsive
    - [ ] No layout overlaps
    - [ ] Checkout fits on small screens
  - **Tool**: Use Chrome DevTools Device Emulation or real devices
  - **Expected Result**: No layout breaks on any device
  - **Evidence**: Save at least one screenshot per breakpoint for checkout and admin pages

---

## Step 8.3: Payment Success/Failure Scenario Tests

- [ ] Payment Scenarios Coverage
  - **Scenario 1**: Successful Razorpay payment
    - [ ] Order created
    - [ ] Email sent
    - [ ] Stock reduced
  - **Scenario 2**: Failed Razorpay payment
    - [ ] Order NOT created
    - [ ] Stock NOT reduced
    - [ ] Error message shown
  - **Scenario 3**: Cancelled Razorpay checkout
    - [ ] Order NOT created
    - [ ] User can retry
    - [ ] No stock impact
  - **Scenario 4**: COD checkout
    - [ ] Order created with Pending status
    - [ ] Shipping charge added
    - [ ] Email sent
  - **Scenario 5**: Coupon with payment
    - [ ] Discount applied to order total
    - [ ] Order reflects correct discount
    - [ ] Coupon usage incremented
  - **Scenario 6**: Insufficient funds on card
    - [ ] Razorpay shows error
    - [ ] Order NOT created
  - **Expected Result**: All 6 scenarios pass
  - **Automation Status**: Scenario 1, 2, 4, and 5 have backend verification coverage; Scenario 3 and 6 still require live Razorpay/manual UI verification

---

## Step 8.4: Multi-User Concurrent Testing

- [ ] Concurrent User Load Test (Manual)
  - **Setup**: 5 browser windows/tabs
  - **User A**: Browse shop
  - **User B**: Add items & checkout
  - **User C**: Update cart quantities
  - **User D**: Place COD order
  - **User E**: Update wishlist
  - **Duration**: 10-15 minutes of concurrent activity
  - **Monitor**:
    - [ ] No crashes on frontend
    - [ ] No 500 errors on backend
    - [ ] All users' data isolated
    - [ ] Orders created correctly
    - [ ] Stock accurate
  - **Expected Result**: All users can shop simultaneously without interference
  - **Tip**: Record product stock before the test and compare after all sessions complete

---   

## Step 8.5: Data Integrity Test

- [ ] Database Integrity Verification
  - **Test**: Check MongoDB data after extended use
  - **Commands**:
    ```javascript
    // Product collection
    db.products.find().count()  // Should match admin count
    
    // Orders collection
    db.orders.find().count()  // Should equal # of test orders
    
    // Check all orders have required fields
    db.orders.find({ user: { $exists: false } }).count()  // Should be 0
    
    // Check cart items
    db.cartitems.find().count()  // Should match active carts
    
    // Check wishlist items
    db.wishlistitems.find().count()  // Should match user wishlists
    
    // Verify no duplicate orders
    db.orders.aggregate([
      { $group: { _id: "$_id", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ])  // Should return empty array
    ```
  - **Expected Result**: All queries return expected results, no duplicates
  - **Recommended Command**:
    ```powershell
    cd backend
    npm run test:integrity
    ```

---

# PHASE 9: Deployment Readiness - Production Preparation

**Execution Notes**:
- Frontend production template: [`.env.production.example`](/C:/Ewara%20codes/.env.production.example)
- Backend production template: [`backend/.env.production.example`](/C:/Ewara%20codes/backend/.env.production.example)
- Deployment audit runbook: [PHASE_9_DEPLOYMENT_GUIDE.md](/C:/Ewara%20codes/PHASE_9_DEPLOYMENT_GUIDE.md)
- Automated Phase 9 checks from project root:
  ```powershell
  npm run audit:deploy
  npm run type-check
  npm run build
  ```
- Backend verification before release:
  ```powershell
  cd backend
  npm test
  npm run test:integrity
  ```

## Step 9.1: Environment Variables Configuration

- [ ] Production Environment Setup
  - **Frontend (.env.production)**:
    ```
    NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_[production_key]
    NEXT_PUBLIC_API_URL=https://api.ewaracosmetics.com
    ```
  - **Backend (.env.production)**:
    ```
    NODE_ENV=production
    PORT=5000
    MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ewara
    RAZORPAY_KEY_SECRET=your_production_secret
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_app_password
    SMTP_FROM="Ewara Cosmetics <noreply@ewaracosmetics.com>"
    JWT_SECRET=your_very_long_random_secret_key_here
    JWT_EXPIRE=7d
    ```
  - **Verification**:
    - [ ] No hardcoded credentials in code
    - [ ] All sensitive data in .env files
    - [ ] .env files in .gitignore
    - [ ] Production keys different from test keys
    - [ ] Database connection string correct
  - **Expected Result**: All environment variables properly configured
  - **Audit Command**: `npm run audit:deploy`

---

## Step 9.2: Database Backup Strategy

- [ ] MongoDB Backup Plan
  - **Daily Backup**:
    ```bash
    # MongoDB Atlas (if using Atlas):
    # - Enable automatic daily backups (7-day retention)
    # - Verify in Atlas dashboard
    
    # Self-hosted MongoDB:
    mongodump --uri "mongodb://localhost:27017/ewara" \
      --out /backups/ewara_$(date +%Y%m%d)
    ```
  - **Weekly Full Backup**: Archive all collections
  - **Before Major Updates**: Manual backup
  - **Restore Test**: Monthly restore from backup to test database
  - **Backup Storage**: Off-site (Google Cloud, AWS S3, or dedicated backup service)
  - **Expected Result**: 
    - [ ] Daily backups running
    - [ ] Backup retention policy in place
    - [ ] Can restore within 1 hour
  - **Recommendation**: Prefer MongoDB Atlas automated backups for production unless you are already operating a managed self-hosted backup pipeline

---

## Step 9.3: Production Deployment Checklist

- [ ] Pre-Deployment Checklist
  - **Code Quality**:
    - [ ] No console.log() in production code
    - [ ] No `debugger` statements
    - [ ] No test data in database
    - [ ] All error boundaries in place
  - **Performance**:
    - [ ] Frontend build optimized (`npm run build`)
    - [ ] Images optimized (use next/image)
    - [ ] Database indexes created
    - [ ] API response times < 500ms
  - **Security**:
    - [ ] Helmet headers enabled
    - [ ] Rate limiting active
    - [ ] CORS restrictive
    - [ ] Input validation comprehensive
    - [ ] No secrets in environment
  - **Monitoring**:
    - [ ] Error logging configured
    - [ ] Performance monitoring active
    - [ ] Alerts set up for critical errors
    - [ ] Uptime monitoring enabled
  - **Testing**:
    - [ ] All critical paths tested
    - [ ] Mobile responsiveness verified
    - [ ] Payment flow tested in production mode (with Razorpay live keys)
    - [ ] Email notifications working
  - **Expected Result**: All checklist items checked before deploy
  - **Automation Status**:
    - `npm run audit:deploy` checks `console.log`, `debugger`, env template leakage, and `vercel.json` secret exposure
    - `npm run build` validates frontend production buildability
    - `cd backend && npm test` validates backend controller coverage
    - `cd backend && npm run test:integrity` validates live MongoDB consistency

---

## Step 9.4: Monitoring & Error Tracking Setup

- [ ] Production Monitoring (Choose at least one per category)
  - **Error Tracking**:
    - [ ] Sentry (recommended)
    - [ ] LogRocket
    - [ ] Rollbar
  - **Performance Monitoring**:
    - [ ] New Relic
    - [ ] Datadog
    - [ ] Google Analytics 4
  - **Logging**:
    - [ ] Winston (Node.js)
    - [ ] Bunyan
    - [ ] Cloud Logging (GCP)
  - **Uptime Monitoring**:
    - [ ] UptimeRobot
    - [ ] Pingdom
    - [ ] Better Stack
  - **Setup**:
    - [ ] Error tracking SDK installed
    - [ ] Performance monitoring active
    - [ ] Logs centralized
    - [ ] Alerts configured for:
      - High error rate
      - API response time > 1s
      - Database connection failures
      - Payment failures
  - **Expected Result**: Monitoring alerts received for any issues
  - **Minimum Recommended Stack**:
    - Error tracking: Sentry
    - Logging: structured backend logger plus host log retention
    - Uptime: UptimeRobot or Better Stack
    - Performance: Sentry performance or New Relic

---

# EXACT ONE-BY-ONE IMPLEMENTATION ROADMAP

Complete these tasks in this exact order:

## Phase 1: Payment Foundation (Days 1-2)
- [ ] 1. Verify Razorpay test keys in .env files (Step 1.1)
- [ ] 2. Test successful Razorpay payment flow (Step 1.2)
- [ ] 3. Test Razorpay payment failure handling (Step 1.3)
- [ ] 4. Test COD payment flow (Step 1.4)
- [ ] 5. Verify order created in database after payment
- [ ] 6. Verify email sent on successful payment
- [ ] 7. Verify stock reduced after order creation
- [ ] 8. Test order success page displays correctly

## Phase 2: Order Tracking (Day 3)
- [x] 9. Test user can view order list at `/orders` ✅ PASSED
- [x] 10. Test user can view order details ✅ PASSED
- [x] 11. Test order tracker UI shows correct status ✅ PASSED
- [x] 12. Verify cannot see other users' orders ✅ PASSED
- [x] 13. Test order details across mobile/desktop ✅ PASSED

## Phase 3: Admin Dashboard (Days 4-5)
- [x] 14. Test admin dashboard loads and shows metrics ✅ PASSED (Step 3.1)
- [ ] 15. Test admin product list page (Step 3.2)
- [ ] 16. Test create new product as admin (Step 3.2)
- [ ] 17. Test edit product as admin (Step 3.2)
- [ ] 18. Test delete product as admin (Step 3.2)
- [ ] 19. Test admin orders page lists all orders (Step 3.3)
- [ ] 20. Test admin can update order status (Step 3.3)
- [ ] 21. Test admin users page lists all users (Step 3.4)
- [ ] 22. Test admin can change user role (Step 3.4)
- [ ] 23. Test admin coupons page (Step 3.5)
- [ ] 24. Test create coupon as admin (Step 3.5)
- [ ] 25. Test apply coupon in customer checkout (Step 3.5)
- [ ] 26. Test coupon discount calculation (Step 3.5)
- [ ] 27. Test delete coupon as admin (Step 3.5)

## Phase 4: User Data Safety (Days 6-7)
- [ ] 28. Test cannot access another user's addresses
- [ ] 29. Test cart persists after page refresh
- [ ] 30. Test cart persists after logout/login
- [ ] 31. Test wishlist persists after refresh
- [ ] 32. Test wishlist persists after logout/login
- [ ] 33. Test cannot view another user's orders
- [ ] 34. Test 2-3 concurrent users shopping (no crosstalk)

## Phase 5: Inventory & Coupons (Day 8)
- [ ] 35. Test cannot oversell (stock < quantity)
- [ ] 36. Test coupon minimum purchase requirement
- [ ] 37. Test coupon usage limit
- [ ] 38. Test expired coupons rejected
- [ ] 39. Test Razorpay orders have 0 shipping
- [ ] 40. Test COD orders have 50 Rs shipping

## Phase 6: Email Notifications (Day 9)
- [ ] 41. Send test email via email test endpoint
- [ ] 42. Receive order confirmation email on Razorpay payment
- [ ] 43. Receive order confirmation email on COD
- [ ] 44. Receive payment success email after Razorpay
- [ ] 45. Test admin can update order status (if UI exists)
- [ ] 46. Receive shipped email when status → Shipped

## Phase 7: Security (Day 10)
- [ ] 47. Test CORS works from localhost:3003 only
- [ ] 48. Test API rejects requests without token (401)
- [ ] 49. Test API rejects invalid tokens (401)
- [ ] 50. Test admin endpoints reject regular users (403)
- [ ] 51. Test invalid ObjectIds return 400
- [ ] 52. Verify rate limiting on login endpoint

## Phase 8: Testing (Day 11)
- [ ] 53. Run complete E2E checkout test (8.1)
- [ ] 54. Test homepage on mobile device
- [ ] 55. Test shop page on mobile device
- [ ] 56. Test checkout modal on mobile device
- [ ] 57. Test payment success scenario
- [ ] 58. Test payment failure scenario
- [ ] 59. Test 3 concurrent users shopping
- [ ] 60. Verify MongoDB data integrity

## Phase 9: Production (Day 12)
- [ ] 61. Set up production environment variables
- [ ] 62. Configure database backup strategy
- [ ] 63. Set up error tracking (Sentry or alternative)
- [ ] 64. Set up performance monitoring
- [ ] 65. Configure uptime monitoring
- [ ] 66. Review pre-deployment checklist (9.3)
- [ ] 67. Test with Razorpay live keys (small amount)
- [ ] 68. Deploy to production
- [ ] 69. Verify all features work in production
- [ ] 70. Monitor for 24 hours post-deployment

---

## Status & Next Steps

**Current State**: Code inspected, manual created. Ready for phased implementation.

**How to Use This Manual**:
1. **Choose ONE step** from the roadmap
2. **I'll provide exact code** for that step only
3. **You test manually** using provided test steps
4. **Confirm it works** 
5. **Move to next step**

**Example Flow**:
- You: "Start with Step 1.1 - Razorpay Setup"
- Me: Provide verification code + detailed setup
- You: Test and confirm working
- You: "Ready for Step 1.2"
- Me: Provide Step 1.2 code

---

## Document Notes

- **Brutally Honest**: Marked what's NOT done (Helmet, Load Testing, Backup Strategy)
- **Code-Based**: All recommendations based on actual code inspection
- **Practical**: Every step has manual test instructions you can follow right now
- **Prioritized**: Roadmap goes from critical (Payment) → important (Admin) → nice-to-have (Monitoring)
- **Safe**: No code changes until you explicitly choose a step

**Ready to begin? Choose your first step from the roadmap above, and I'll provide implementation code + detailed test instructions.**

