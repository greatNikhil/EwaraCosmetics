# Step 3.2: Admin Product Management - Testing Guide

**Status**: Ready to Test  
**Previous Step**: 3.1 ✅ PASSED  
**Date**: April 24, 2026

---

## 📋 Prerequisites

### Admin Account Ready ✅
- Email: `admin@ewara.com`
- Password: `admin123`
- Already tested and verified in Step 3.1

### Current Database State ✅
- Total Products: 1 (can be viewed/edited/deleted)
- Test scenarios: Create new, edit existing, delete

### Servers Running ✅
- Frontend: http://localhost:3003
- Backend: http://localhost:5000
- Database: MongoDB (ewara)

---

## 🎯 Step 3.2 Overview

**Goal**: Verify admin can manage products (Create, Read, Update, Delete)

**Why it matters**: Product management is core admin function

**Files Involved**:
- Frontend: `app/admin/products/page.tsx` (list)
- Frontend: `app/admin/products/add/page.tsx` (create)
- Frontend: `app/admin/products/edit/page.tsx` (edit)
- Backend: `backend/src/controllers/product.controller.ts`
- Backend: `backend/src/routes/product.routes.ts`

---

## 🧪 Test 1: View Product List (READ)

### Manual Test Steps:

1. **Ensure Logged in as Admin**
   - Already logged in from Step 3.1, or:
   - Go to http://localhost:3003/admin
   - If prompted, login with admin@ewara.com / admin123

2. **Navigate to Products Management**
   - Click "Products" in admin sidebar/menu
   - Or go to http://localhost:3003/admin/products

3. **Verify Products List Displays**
   - [ ] Page loads (no 404 error)
   - [ ] Products list visible with table/cards
   - [ ] Current product shown:
     - Name (product name)
     - Price (Rs. amount)
     - Stock (count in stock)
     - Category (product category)
     - Status (Published/Draft if applicable)

4. **Verify List Actions Available**
   - [ ] Edit button for each product
   - [ ] Delete button for each product
   - [ ] View/Details button (optional)

5. **Verify No Console Errors**
   - Press F12 → Console tab
   - [ ] No red error messages
   - [ ] No 404 errors for API calls
   - [ ] Products loaded successfully

### Expected Result:
- ✅ Products list page loads
- ✅ At least 1 product visible
- ✅ All product details display
- ✅ Edit/Delete buttons present
- ✅ No console errors

---

## 🧪 Test 2: Create New Product (CREATE)

### Manual Test Steps:

1. **On Products List Page**, find "Add Product" or "Create Product" button
   - Click it
   - Or go to http://localhost:3003/admin/products/add

2. **Verify Form Displays**
   - [ ] Product form loads
   - [ ] Form has these fields:
     - Product Name (text input)
     - Price (number input)
     - Description (text area)
     - Category (dropdown/select)
     - Stock/Quantity (number input)
     - Images (upload/file input)
     - Published Status (checkbox/toggle)

3. **Fill Product Form with Test Data**
   ```
   Name:        Test Serum Pro
   Price:       Rs. 1299
   Description: Advanced anti-aging serum with Vitamin C
   Category:    Skincare
   Stock:       50
   Images:      Upload 1-2 images (or leave blank if optional)
   Published:   Yes (check if applicable)
   ```

4. **Submit Form**
   - Click "Save Product" or "Create" button
   - Wait for response

5. **Verify Product Created**
   - [ ] Redirected back to products list
   - [ ] New product appears in list
   - [ ] Details match what was entered:
     - Name: "Test Serum Pro"
     - Price: "1299"
     - Stock: "50"
     - Category: "Skincare"

6. **Verify in Database** (Optional)
   - Open browser DevTools Console
   - Check MongoDB if you have access to verify

### Expected Result:
- ✅ Add Product form displays
- ✅ All fields present and functional
- ✅ Form submission succeeds
- ✅ New product appears in list
- ✅ Product details saved correctly
- ✅ No validation errors

### Common Issues:
- Form validation errors → Check required fields
- Image upload fails → Images may be optional
- "Cannot create product" error → Check backend logs

---

## 🧪 Test 3: Edit Existing Product (UPDATE)

### Manual Test Steps:

1. **On Products List Page**, click "Edit" button on the new product you created
   - Or go to http://localhost:3003/admin/products/edit/[product-id]

2. **Verify Edit Form Displays**
   - [ ] Form loads with current product data
   - [ ] All fields pre-filled with existing values:
     - Name shows "Test Serum Pro"
     - Price shows "1299"
     - Stock shows "50"
     - Category shows "Skincare"

3. **Make Changes to Product**
   - Change Price: 1299 → 999 (discount)
   - Change Stock: 50 → 45 (simulate selling 5 units)
   - Or change Description: Add new text
   - Example:
     ```
     New Price:    Rs. 999 (was 1299)
     New Stock:    45 (was 50)
     New Desc:     Advanced anti-aging serum with Vitamin C and Niacinamide - SALE
     ```

4. **Save Changes**
   - Click "Save Product" or "Update" button
   - Wait for response

5. **Verify Changes Saved**
   - [ ] Redirected back to products list
   - [ ] Product shows updated values:
     - Price: "999" (updated)
     - Stock: "45" (updated)
     - Description contains new text

6. **Verify in Database** (Optional)
   - Check that changes persisted in MongoDB

### Expected Result:
- ✅ Edit form displays with current data
- ✅ Can modify all fields
- ✅ Changes save successfully
- ✅ Product list shows updated values
- ✅ No validation errors

### Common Issues:
- "Product not found" → Check product ID in URL
- Changes don't save → Check backend logs for errors
- Form validation error → Verify all required fields filled

---

## 🧪 Test 4: Delete Product (DELETE)

### Manual Test Steps:

1. **On Products List Page**, look for the test product "Test Serum Pro"

2. **Click Delete Button** (or similar)
   - Should show confirmation dialog/modal
   - Example: "Are you sure you want to delete this product?"

3. **Confirm Deletion**
   - [ ] Confirmation modal appears
   - [ ] Click "Confirm" or "Delete" button
   - Or: Click "Cancel" to test cancellation (optional)

4. **Verify Product Deleted**
   - [ ] Product removed from list
   - [ ] Product no longer appears in admin products page
   - [ ] No "Test Serum Pro" visible

5. **Test Product No Longer Available**
   - Go to shop/products page as regular user
   - Search for "Test Serum Pro"
   - [ ] Product should not appear

6. **Verify in Database** (Optional)
   - Check MongoDB - product should be gone or marked deleted

### Expected Result:
- ✅ Delete button present
- ✅ Confirmation dialog shown
- ✅ Product deleted after confirmation
- ✅ Product removed from list
- ✅ No longer visible to customers
- ✅ Database reflects deletion

### Common Issues:
- Confirmation not shown → May not have delete confirmation UI
- Product still appears → Page may need refresh
- "Cannot delete" error → Check if product has related orders

---

## 🧪 Test 5: Product Stock Management

### Manual Test Steps:

1. **Create Another Test Product** (optional)
   - Name: "Test Cream"
   - Price: Rs. 899
   - Stock: 10

2. **Verify Stock Display** on products list
   - [ ] Shows "10" or "Stock: 10"

3. **Edit Product** and reduce stock
   - Click Edit on "Test Cream"
   - Change Stock: 10 → 3
   - Save

4. **Verify Low Stock Alert** (if implemented)
   - [ ] Dashboard may show warning if stock ≤ 5
   - Or: Admin might see "Low Stock" indicator on product

5. **Test Stock Cannot Go Negative**
   - Edit product, try to set stock to -5 or negative
   - [ ] Should show validation error
   - [ ] Cannot save with negative stock

### Expected Result:
- ✅ Stock displays correctly on list
- ✅ Can update stock numbers
- ✅ Stock cannot be set to negative
- ✅ Low stock alerts work (if implemented)

---

## 🧪 Test 6: Product Categories

### Manual Test Steps:

1. **On Create/Edit Product Form**, check Category field

2. **Verify Categories Available**
   - [ ] Can select from dropdown/list
   - [ ] Common categories visible:
     - Skincare
     - Hair Care
     - Fragrance
     - Other categories based on your store

3. **Create Product with Different Categories**
   - Create "Test Fragrance" with Category: Fragrance
   - Create "Test Oil" with Category: Hair Care

4. **Verify Categories on List**
   - [ ] Products display with correct categories
   - [ ] Categories are organized/sortable (if implemented)

### Expected Result:
- ✅ Category field functional
- ✅ Can select from available categories
- ✅ Products saved with correct category
- ✅ Categories display on list

---

## 🧪 Test 7: Product Images

### Manual Test Steps:

1. **On Create Product Form**, find Images field

2. **Test Image Upload** (if applicable)
   - [ ] Can upload image files (JPG, PNG, etc.)
   - [ ] File input visible and functional
   - Or: Image URL input if images are linked

3. **Create Product with Image**
   - Upload or add image URL
   - Save product
   - [ ] Product appears on list with image thumbnail

4. **Verify Images on Shop Page**
   - Go to shop as regular user (http://localhost:3003/shop)
   - [ ] Created product visible
   - [ ] Product image displays

5. **Test Missing Image**
   - Edit a product, remove image (if possible)
   - [ ] Should show placeholder or default image
   - [ ] Product still displays without breaking layout

### Expected Result:
- ✅ Can upload/add images
- ✅ Images display on product list
- ✅ Images display on shop page
- ✅ Missing images handled gracefully

---

## 🧪 Test 8: Product Published Status

### Manual Test Steps:

1. **On Create/Edit Product Form**, look for "Published" checkbox/toggle

2. **Create Product - Unpublished**
   - Fill form with product details
   - **Uncheck** "Published" if it's checked (or check if default unchecked)
   - Save product

3. **Verify Unpublished Product**
   - On admin products list: Product visible (even if unpublished)
   - Go to shop page as regular user: **Product should NOT appear** (if not published)

4. **Edit Product - Publish It**
   - Go to admin products
   - Click Edit on the unpublished product
   - **Check** "Published" checkbox
   - Save

5. **Verify Published Product**
   - On admin list: Product visible with "Published" status
   - Go to shop page: **Product NOW appears**

### Expected Result:
- ✅ Published status toggle works
- ✅ Unpublished products don't show in shop
- ✅ Published products visible in shop
- ✅ Can toggle status on/off

---

## 🧪 Test 9: Product Validation

### Manual Test Steps:

1. **Test Required Fields**
   - Try to save product with blank Name
   - [ ] Should show validation error: "Name is required"
   - Cannot save without required fields

2. **Test Price Validation**
   - Try to save with Price: "abc" or negative value
   - [ ] Should show error: "Price must be a number" or similar
   - [ ] Cannot save with invalid price

3. **Test Stock Validation**
   - Try to save with Stock: "invalid" or negative
   - [ ] Should show error
   - [ ] Cannot save with invalid stock

4. **Test Duplicate Product Name** (if applicable)
   - Try to create product with same name as existing product
   - [ ] May show warning or auto-generate unique name
   - Or: May allow duplicates (depends on system design)

### Expected Result:
- ✅ Required field validation works
- ✅ Number field validation works (price, stock)
- ✅ Cannot save invalid data
- ✅ Clear error messages shown

---

## 📊 Testing Checklist

Mark these as you complete each test:

### CRUD Operations:
- [ ] Test 1: Read/List products ✅
- [ ] Test 2: Create new product ✅
- [ ] Test 3: Update existing product ✅
- [ ] Test 4: Delete product ✅

### Product Details:
- [ ] Test 5: Stock management works
- [ ] Test 6: Categories functional
- [ ] Test 7: Images upload/display
- [ ] Test 8: Published status controls visibility
- [ ] Test 9: Form validation works

### Success Criteria:
- ✅ All CRUD operations work
- ✅ Products persist in database
- ✅ Stock updates correctly
- ✅ Images display properly
- ✅ Published status affects visibility
- ✅ Form validation works
- ✅ No console errors

---

## ✅ Step 3.2 Complete When:

- [x] Admin account logged in
- [ ] Can view product list
- [ ] Can create new product
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Stock management works
- [ ] Categories functional
- [ ] Published status works
- [ ] Form validation works
- [ ] No console errors
- [ ] All 9 tests pass

---

## 🚀 After Step 3.2

If all tests ✅ pass:
- Move to **Step 3.3**: Admin Order Management
- Move to **Step 3.4**: Admin User Management
- Continue with remaining admin features

If any tests ❌ fail:
- Note which test failed
- Check browser console (F12 → Console)
- Check backend logs
- Report specific error

---

## 📝 Quick Reference

### Admin Products URL:
```
List:   http://localhost:3003/admin/products
Create: http://localhost:3003/admin/products/add
Edit:   http://localhost:3003/admin/products/edit/[product-id]
```

### Test Product Data Template:
```
Name:        Test [ProductType]
Price:       Rs. [100-5000]
Description: Test description for [ProductType]
Category:    Skincare/Hair/Fragrance
Stock:       [10-100]
Images:      Upload or skip
Published:   Yes/No
```

### Database Check (Optional):
```javascript
// MongoDB commands
db.products.find().count()           // Count products
db.products.findOne({name: "Test Serum Pro"})  // Find test product
db.products.deleteMany({name: /^Test/})  // Clean up test products
```

---

**Ready to test? Start with Step 3.2!** 🚀
