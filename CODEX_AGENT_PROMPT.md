# MongoDB to MySQL Migration - Codex Agent Prompt

## PROJECT CONTEXT

**Goal:** Complete the migration of Ewara Cosmetics backend from MongoDB/Mongoose to MySQL/Sequelize ORM.

**Status:** 40% Complete
- ✅ All 10 models converted to Sequelize (User, Product, Order, Coupon, Offer, Review, Address, OTP, CartItem, WishlistItem)
- ✅ Database connection config converted to Sequelize
- ✅ Auth controller converted (8 functions)
- ✅ Product controller converted (6 functions)
- ❌ 7 remaining controllers need conversion
- ❌ Scripts need updating
- ❌ Testing not yet done

**Codebase:** Next.js frontend + Express backend at `c:\Ewara codes`

---

## TASK: Convert Remaining Controllers to Sequelize

### Phase 1: Controller Conversions

**Files to convert (in order of priority):**
1. `backend/src/controllers/order.controller.ts` - CRITICAL (most complex)
2. `backend/src/controllers/address.controller.ts`
3. `backend/src/controllers/admin.controller.ts`
4. `backend/src/controllers/coupon.controller.ts`
5. `backend/src/controllers/review.controller.ts`
6. `backend/src/controllers/offer.controller.ts`
7. `backend/src/controllers/promo.controller.ts`

**Conversion Pattern Reference:**

| Operation | Old (Mongoose) | New (Sequelize) |
|-----------|---|---|
| Import | `import mongoose from 'mongoose'` | `import { Op } from 'sequelize'` |
| Find all | `Model.find({})` | `Model.findAll({where: {}})` |
| Find one | `Model.findOne({field: val})` | `Model.findOne({where: {field: val}})` |
| Find by ID | `Model.findById(id)` | `Model.findByPk(id)` |
| Create | `Model.create({data})` | `Model.create({data})` |
| Update | `doc.save()` or `Model.updateOne()` | `doc.update(data)` then `doc.save()` |
| Delete one | `Model.deleteOne({_id})` | `Model.destroy({where: {id}})` |
| Delete many | `Model.deleteMany({field})` | `Model.destroy({where: {field}})` |
| Count | `Model.countDocuments(where)` | `Model.count({where})` |
| Paginate | `.skip(n).limit(m)` | `offset: n, limit: m` |
| Sort | `.sort({field: -1})` | `order: [['field', 'DESC']]` |
| Select fields | `.select("field1 field2")` | `attributes: ['field1', 'field2']` |
| Exclude fields | `.select("-password")` | `attributes: {exclude: ['password']}` |
| Regex search | `{$regex: text, $options: 'i'}` | `{[Op.like]: '%text%'}` |
| Not equal | `{_id: {$ne: id}}` | `{id: {[Op.ne]: id}}` |
| Greater than | `{$gt: val}` | `{[Op.gt]: val}` |
| Less than | `{$lt: val}` | `{[Op.lt]: val}` |
| In array | `{$in: [vals]}` | `{[Op.in]: [vals]}` |
| Valid ID check | `mongoose.isValidObjectId(id)` | `!isNaN(Number(id))` |
| Populate relations | `.populate('model')` | `include: [{model: Model}]` |
| Response fields | `_id in response` | `Always include both _id: user.id and id: user.id` |

---

### Phase 2: Script Updates

**Files to update:**
1. `backend/scripts/create-admin-user.ts` - Replace mongoose queries
2. `backend/scripts/seed-test-orders.ts` - Replace mongoose queries
3. `backend/verify-mongodb.js` - Replace or remove (MongoDB specific)

---

### Phase 3: Testing

**Local Testing Checklist:**
- [ ] Setup local MySQL database
- [ ] Run `npm run dev` in backend - should start without errors
- [ ] Test API: POST /api/auth/send-otp
- [ ] Test API: POST /api/auth/register
- [ ] Test API: POST /api/auth/login
- [ ] Test API: GET /api/products (with filters)
- [ ] Test API: POST /api/products (admin)
- [ ] Test API: POST /api/orders (create order)
- [ ] Test API: GET /api/orders/:id
- [ ] Test API: PUT /api/orders/:id (update status)
- [ ] Test API: POST /api/addresses
- [ ] Test API: GET /api/addresses
- [ ] Test API: DELETE /api/addresses/:id
- [ ] Test API: POST /api/reviews
- [ ] Test API: POST /api/coupons (admin)
- [ ] Test API: GET /api/coupons
- [ ] Admin dashboard loads

---

## SPECIFIC CONTROLLER DETAILS

### 1. Order Controller (MOST CRITICAL)

**Key functions to convert:**
- `createOrder()` - Complex; validate products, calculate amounts, handle Razorpay
- `getOrdersByUser()` - Find orders for user
- `getOrderById()` - Fetch with relations
- `updateOrderStatus()` - Update status
- `getAllOrders()` - Admin endpoint with filtering
- `deleteOrder()` - Admin endpoint

**Special handling:**
- Items field is JSON array - store as JSON type
- Relationships: Order.user -> User.id
- Razorpay signature verification unchanged
- Email notifications unchanged

**Critical patterns:**
```typescript
// Find all orders for user with sorting
- Order.find({user: userId}).sort({createdAt: -1})
+ Order.findAll({where: {user: userId}, order: [['createdAt', 'DESC']]})

// Find with populate
- Order.findById(id).populate('user')
+ Order.findByPk(id, {include: [{model: User}]})

// Update order status
- order.status = 'Shipped'
- order.save()
+ order.update({status: 'Shipped'})
+ await order.save()

// Find orders with multiple filters
- Order.find({status: 'Pending', user: userId})
+ Order.findAll({where: {status: 'Pending', user: userId}})
```

### 2. Address Controller

**Key functions:**
- `getAddresses()` - Find all user addresses
- `createAddress()` - Create new address
- `updateAddress()` - Update existing address
- `deleteAddress()` - Delete address
- `setDefaultAddress()` - Set default address for user

**Special handling:**
- user field: reference to User.id
- default field: boolean to mark default address
- Compound index on (user_id, default)

### 3. Admin Controller

**Key functions:**
- `getAdminStats()` - Aggregate data (orders, revenue, users)
- `getAllUsers()` - Get all users with pagination
- `getAllOrders()` - Get all orders with filtering
- `updateOrderStatus()` - Admin endpoint
- `getUserDetails()` - Get single user

**Special handling:**
- Aggregation queries need Sequelize's `findAll()` with count
- May need multiple queries instead of single aggregation pipeline

### 4-7. Other Controllers

**Coupon Controller:**
- Simple CRUD operations
- `findOne({code})` → `findOne({where: {code}})`
- `.deleteMany()` → `.destroy({where: {}})`

**Review Controller:**
- Relations with Product and User
- Unique constraint on (product_id, user_id)
- Sorting by createdAt

**Offer Controller:**
- Simple model, basic CRUD
- Sorting by displayOrder

**Promo Controller:**
- Similar to Offer, basic operations

---

## CONVERSION RULES (STRICT)

1. **Always import Op:** `import { Op } from 'sequelize'` at top of file
2. **Where clause REQUIRED:** Never call `Model.findOne()` without `{where: {...}}`
3. **Numeric IDs:** Use `Number(id)` not `new ObjectId(id)`
4. **Response format:** Always include `_id: user.id` for frontend compatibility
5. **Error handling:** Keep existing error messages and HTTP status codes
6. **No breaking changes:** All API responses must be identical to Mongoose version
7. **Use attributes for field selection:** Don't use `.select()`, use `attributes: []`
8. **Lean not needed:** Sequelize already returns plain objects
9. **Transactions:** Use `sequelize.transaction()` for multi-step operations
10. **Timestamps:** Already enabled in model definitions

---

## GIT COMMIT STRATEGY

After converting EACH controller, commit with:
```bash
git add backend/src/controllers/[controller].ts
git commit -m "Convert [controller].ts from Mongoose to Sequelize: Update all query patterns"
git push origin master
```

After all controllers:
```bash
git add backend/scripts/
git commit -m "Update scripts to use Sequelize models"
git push origin master
```

---

## EXPECTED OUTCOMES

After completion:
1. All 7 controllers using Sequelize queries
2. All scripts updated
3. No Mongoose imports in backend/src/controllers/
4. No MongoDB operators ($ne, $regex, etc.) in code
5. All API endpoints return same response format as before
6. Backend runs locally with MySQL without errors
7. All CRUD operations tested and working

---

## INSTRUCTIONS FOR AGENT

1. **Start with order.controller.ts** - it's the most complex and most used
2. **Use multi_replace_string_in_file** - to make many replacements efficiently
3. **Include 3-5 lines of context** around each replacement for accuracy
4. **Test imports** - Ensure `{ Op }` is imported where used
5. **Preserve business logic** - Only change database layer, not calculations or validations
6. **Check for populate()** - Convert each to Sequelize `include`
7. **Search for patterns** - Look for `.find(`, `.findOne(`, `.findById(`, `.deleteOne(`, etc.
8. **Commit after each file** - Build momentum and track progress
9. **Update todo list** - Mark off completed items
10. **Save progress to repo** - Push to GitHub regularly

---

## KEY FILES REFERENCE

**Already converted (DO NOT modify):**
- ✅ `backend/src/models/*.ts` - All models are Sequelize
- ✅ `backend/src/config/db.ts` - Connection is Sequelize
- ✅ `backend/src/controllers/auth.controller.ts` - Already converted
- ✅ `backend/src/controllers/product.controller.ts` - Already converted

**Need conversion:**
- ❌ `backend/src/controllers/order.controller.ts`
- ❌ `backend/src/controllers/address.controller.ts`
- ❌ `backend/src/controllers/admin.controller.ts`
- ❌ `backend/src/controllers/coupon.controller.ts`
- ❌ `backend/src/controllers/review.controller.ts`
- ❌ `backend/src/controllers/offer.controller.ts`
- ❌ `backend/src/controllers/promo.controller.ts`
- ❌ `backend/scripts/*.ts`

---

## SUCCESS CRITERIA

- [ ] All 7 controllers converted to Sequelize syntax
- [ ] All scripts updated
- [ ] No Mongoose imports remain in controllers
- [ ] All files pushed to GitHub
- [ ] Backend starts without compilation errors
- [ ] All API endpoints testable
- [ ] Response format matches original Mongoose version
- [ ] No breaking changes to frontend

---

## START NOW

Begin with `backend/src/controllers/order.controller.ts`. Follow the conversion patterns above. Use efficient multi-replace operations. Commit after each file. Track progress in todo list.

**Timeline:** Should take 2-3 hours for experienced developer to complete all 7 controllers + scripts + testing.
