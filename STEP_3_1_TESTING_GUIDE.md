# Step 3.1: Admin Dashboard - Testing Guide

**Status**: Ready to Test  
**Date**: April 24, 2026

---

## 📋 Prerequisites

### Admin Account Created ✅
- Email: `admin@ewara.com`
- Password: `admin123`
- Role: `admin`
- User ID: `69eb7264d8d1d275d9a59eca`

### Expected Database Metrics ✅
- **Total Users**: 7
- **Total Products**: 1
- **Total Orders**: 13
- **Total Revenue**: Rs. 134,761
- **Order Status Breakdown**:
  - Pending: 7
  - Processing: 2
  - Shipped: 2
  - Delivered: 0
  - Cancelled: 2

### Servers Running ✅
- Frontend: http://localhost:3003
- Backend: http://localhost:5000
- Database: MongoDB (ewara)

---

## 🧪 Test 1: Admin Can Access Dashboard

### Manual Test Steps:

1. **Open Frontend**
   - Go to http://localhost:3003
   - You should see the home page

2. **Navigate to Login**
   - Click "Login" button or go to http://localhost:3003/login
   - You should see login form

3. **Login as Admin**
   - Email: `admin@ewara.com`
   - Password: `admin123`
   - Click "Login"

4. **Navigate to Admin Dashboard**
   - After successful login, click on profile icon or navigate to http://localhost:3003/admin
   - You should see the admin dashboard page

5. **Dashboard Should Load Successfully**
   - ✅ Page should display without 404 errors
   - ✅ No "Access Denied" message
   - ✅ No redirect to login page
   - ✅ No console errors (press F12, check Console tab)

### Expected Result:
- ✅ Dashboard page loads
- ✅ Shows business metrics cards
- ✅ Admin navigation visible
- ✅ No authentication errors

---

## 🧪 Test 2: Dashboard Metrics Are Correct

### Manual Test Steps:

1. **On Admin Dashboard Page**, verify these metrics are displayed:

#### Metric Card 1: Total Users
- **Expected Value**: 7
- **Where**: Should show in a card/stat box
- **Verify**: 
  - [ ] Card displays "7" or similar
  - [ ] Label says "Users" or "Total Users"
  - [ ] No display errors (NaN, undefined, etc.)

#### Metric Card 2: Total Products
- **Expected Value**: 1
- **Where**: Should show in a card/stat box
- **Verify**:
  - [ ] Card displays "1" or similar
  - [ ] Label says "Products" or "Total Products"
  - [ ] No display errors

#### Metric Card 3: Total Orders
- **Expected Value**: 13
- **Where**: Should show in a card/stat box
- **Verify**:
  - [ ] Card displays "13" or similar
  - [ ] Label says "Orders" or "Total Orders"
  - [ ] No display errors

#### Metric Card 4: Total Revenue
- **Expected Value**: Rs. 134,761 (or 134761)
- **Where**: Should show in a card/stat box with currency format
- **Verify**:
  - [ ] Card displays "134,761" or "1,34,761" (Indian format)
  - [ ] Shows "Rs." or "₹" symbol
  - [ ] Label says "Revenue" or "Total Revenue"
  - [ ] No display errors

### Expected Result:
- ✅ All 4 metrics displayed correctly
- ✅ Numbers match expected values (7, 1, 13, 134761)
- ✅ Proper formatting (currency for revenue)
- ✅ No NaN or undefined values

---

## 🧪 Test 3: Recent Orders Section

### Manual Test Steps:

1. **On Admin Dashboard**, scroll down to find "Recent Orders" section

2. **Verify Section Shows**
   - [ ] Section title visible ("Recent Orders" or similar)
   - [ ] At least 5 orders listed (or fewer if database has fewer)
   - [ ] Each order shows: Order ID, Customer Name, Amount, Status, Date

3. **Verify Order Details**
   - [ ] First order should be: `69eb6dd512164024b7ea275e`
   - [ ] Customer: "Test Customer" or "test@ewara.com"
   - [ ] Amount: Rs. 1533
   - [ ] Status: "Processing"
   - [ ] Date: 24/4/2026

4. **Verify No Errors**
   - [ ] All orders display correctly
   - [ ] No broken layout
   - [ ] Timestamps formatted properly

### Expected Result:
- ✅ Recent Orders section visible
- ✅ 5 latest orders listed
- ✅ Order details correct
- ✅ No loading errors

---

## 🧪 Test 4: Order Status Breakdown

### Manual Test Steps:

1. **On Admin Dashboard**, look for order status breakdown (may be a chart or list)

2. **Verify Status Counts Display**
   - [ ] Pending: 7
   - [ ] Processing: 2
   - [ ] Shipped: 2
   - [ ] Delivered: 0
   - [ ] Cancelled: 2
   - **Total**: 13 (should equal total orders)

3. **Verify Visualization**
   - [ ] Status breakdown visible (chart, list, or cards)
   - [ ] Numbers match expected values
   - [ ] No display errors

### Expected Result:
- ✅ Order status breakdown displayed
- ✅ Counts match expected values
- ✅ All statuses shown

---

## 🧪 Test 5: Recent Users Section

### Manual Test Steps:

1. **On Admin Dashboard**, scroll to find "Recent Users" section

2. **Verify Section Shows**
   - [ ] Section title visible
   - [ ] At least 5 users listed
   - [ ] Each user shows: Name, Email, Phone, Role, Join Date

3. **Verify User Details** (Recent Users should be):
   1. Admin User (admin@ewara.com) - Admin role
   2. Test Customer (test@ewara.com) - User role
   3. Babu Sona (chaubeyambujesh111@gmail.com) - User role
   4. Anuj yadav (pt018432@gmail.com) - User role
   5. Nikhil Chaubey (chaubeynikhil649@gmail.com) - Admin role

4. **Verify Details Correct**
   - [ ] Roles display correctly (admin/user)
   - [ ] Email addresses visible
   - [ ] Join dates formatted properly
   - [ ] No errors in display

### Expected Result:
- ✅ Recent Users section visible
- ✅ 5 latest users listed
- ✅ User details correct
- ✅ Roles display properly

---

## 🧪 Test 6: Low Stock Products Section

### Manual Test Steps:

1. **On Admin Dashboard**, look for "Low Stock Products" section

2. **Expected Result for This Database**:
   - ✅ Should show message like "All products have healthy stock" or similar
   - ✅ No products listed (because all have stock > 5)
   - This is CORRECT behavior

3. **Verify No Errors**
   - [ ] Section displays without errors
   - [ ] Proper message shown for empty state
   - [ ] No broken layout

### Expected Result:
- ✅ Low Stock section displays correctly
- ✅ Shows "no low stock items" or similar message
- ✅ No display errors

---

## 🧪 Test 7: No Console Errors

### Manual Test Steps:

1. **Open Browser DevTools**
   - Press F12 (Windows) or Cmd+Option+J (Mac)

2. **Go to Console Tab**
   - Look for any red error messages
   - Note any yellow warnings

3. **Expected Result**: 
   - ✅ No red error messages
   - ✅ No "404 Not Found" errors
   - ✅ No "undefined" or "Cannot read property" errors
   - ✅ No auth-related errors

### Common Errors to Watch For:
- ❌ "Token invalid or expired"
- ❌ "Cannot read property 'totalUsers' of undefined"
- ❌ "Failed to load dashboard summary"
- ❌ 404 from API endpoint

### Expected Result:
- ✅ Clean console (no red errors)
- ✅ Dashboard fully functional
- ✅ All data loaded successfully

---

## 🧪 Test 8: Non-Admin User Cannot Access Dashboard

### Manual Test Steps:

1. **Logout from Admin Account**
   - Click logout button or go to http://localhost:3003/profile
   - Click "Logout" or similar button

2. **Login as Regular User**
   - Email: `test@ewara.com`
   - Password: `password`
   - Click Login

3. **Try to Access Admin Dashboard**
   - Manually type http://localhost:3003/admin in URL bar
   - Or try to find admin link in UI

4. **Expected Result**:
   - ✅ Either:
     - Redirected to home page or login page, OR
     - See "Access Denied" / "Not Authorized" message
   - ✅ Cannot see dashboard metrics
   - ✅ Cannot access any admin features

### Expected Result:
- ✅ Non-admin user redirected/denied
- ✅ No access to sensitive metrics
- ✅ Security enforced properly

---

## 🧪 Test 9: Admin Sidebar/Navigation

### Manual Test Steps:

1. **On Admin Dashboard**, check for admin navigation menu

2. **Verify Menu Items Visible**:
   - [ ] Dashboard link
   - [ ] Products management link
   - [ ] Orders management link
   - [ ] Users management link
   - [ ] Coupons management link
   - [ ] Reviews management link (if implemented)
   - [ ] Logout button

3. **Test Navigation**:
   - [ ] Click each link - should navigate without errors
   - [ ] Can return to dashboard
   - [ ] Menu stays accessible across pages

### Expected Result:
- ✅ Admin navigation menu visible
- ✅ All expected links present
- ✅ Navigation works smoothly

---

## 🧪 Test 10: API Direct Testing (Optional - Advanced)

### Manual Test Steps:

1. **Open Postman or Similar Tool** (or use browser console)

2. **Make API Request**:
   ```
   URL: http://localhost:5000/api/admin/dashboard
   Method: GET
   Headers:
     Authorization: Bearer [admin_token_from_localStorage]
   ```

3. **Get Admin Token from Browser**:
   - Open http://localhost:3003/admin (logged in as admin)
   - Press F12 → Console tab
   - Paste this: `JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token`
   - Copy the token value

4. **Test with Token in Postman**:
   - Replace [admin_token_from_localStorage] with actual token
   - Send request
   - Should get 200 OK response with dashboard data

5. **Verify Response Contains**:
   - [ ] `success: true`
   - [ ] `summary` object with:
     - `totalUsers: 7`
     - `totalProducts: 1`
     - `totalOrders: 13`
     - `totalRevenue: 134761`
     - `recentOrders` array
     - `recentUsers` array
     - `ordersByStatus` object

### Expected Result:
- ✅ API returns 200 OK
- ✅ Response contains all expected fields
- ✅ Metrics values correct
- ✅ No 401/403 errors

---

## 📊 Testing Checklist

Mark these as you complete each test:

### Frontend Tests:
- [ ] Test 1: Admin can login and access dashboard
- [ ] Test 2: All 4 metrics displayed correctly
- [ ] Test 3: Recent orders section shows proper data
- [ ] Test 4: Order status breakdown visible and correct
- [ ] Test 5: Recent users section shows proper data
- [ ] Test 6: Low stock section displays correctly
- [ ] Test 7: No console errors
- [ ] Test 8: Non-admin user cannot access
- [ ] Test 9: Admin sidebar navigation works
- [ ] Test 10 (Optional): API responds correctly

### Success Criteria:
- ✅ All tests pass
- ✅ Metrics match expected values exactly
- ✅ No console errors
- ✅ Non-admin access properly denied
- ✅ All data displays correctly

---

## ✅ Step 3.1 Complete When:

- [x] Admin account created (admin@ewara.com / admin123)
- [ ] Can login as admin
- [ ] Dashboard loads without errors
- [ ] All 4 metrics display correctly (7 users, 1 product, 13 orders, Rs. 134,761)
- [ ] Recent orders/users sections visible and accurate
- [ ] No console errors
- [ ] Non-admin users properly denied access
- [ ] All 10 tests pass

---

## 🚀 Next Steps After Step 3.1

If all tests pass ✅:
- Move to **Step 3.2**: Admin Product Management
- Move to **Step 3.3**: Admin Order Management
- Continue with remaining admin features

If any tests fail ❌:
- Note which test failed
- Check browser console for errors
- Check backend logs (terminal where backend runs)
- Report specific error message

---

## 📝 Testing Notes

### Expected Behavior:
- Admin dashboard is the main admin hub
- Shows real-time business metrics
- Displays recent activity (orders, users)
- Alerts for low stock items and pending orders
- Access control enforced (only admins can access)

### Common Issues:
1. **404 on /admin page** → Frontend admin page file missing or route not defined
2. **"Not Authorized" message** → User is not admin role, or role not properly set
3. **Metrics showing 0 or NaN** → API not returning data, check backend logs
4. **Token errors** → Auth middleware issue, check JWT secret in .env
5. **Recent orders/users not showing** → API aggregation error, check MongoDB indexes

---

## 📞 Debugging

If tests fail, check:

1. **Backend Logs** (terminal where backend runs):
   ```
   Look for: GET /api/admin/dashboard
   Should show: 200 OK
   Should NOT show: 401 Unauthorized, 403 Forbidden
   ```

2. **Frontend Console** (F12 → Console):
   ```
   Should see: No red error messages
   May see: API calls logged (if enabled)
   ```

3. **Browser Storage** (F12 → Application → LocalStorage):
   ```
   Look for: auth-storage key
   Should contain: user info and token
   ```

4. **Database** (MongoDB):
   ```
   Check users collection has admin role user
   Check orders collection has 13 documents
   Check products collection has 1 document
   ```

---

Good luck with testing! 🎉
