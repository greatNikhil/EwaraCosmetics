# MongoDB → MySQL Migration Guide

## ✅ COMPLETED
- [x] User Model (Sequelize)
- [x] Product Model (Sequelize) 
- [x] Order Model (Sequelize)
- [x] Coupon, Offer, Review, Address, OTP, CartItem, WishlistItem Models (Sequelize)
- [x] Database Config (Sequelize Connection)
- [x] Auth Controller (Sequelize Queries)
- [x] Product Controller (Sequelize Queries)

## 📋 REMAINING CONTROLLERS (Follow Pattern Below)

### Quick Conversion Reference

**File:** `backend/src/controllers/[controller].ts`

| Operation | Mongoose | Sequelize | Example |
|-----------|----------|-----------|---------|
| Find all | `Model.find()` | `Model.findAll()` | `Product.findAll({where: {}})` |
| Find one | `Model.findOne()` | `Model.findOne()` | `User.findOne({where: {email}})` |
| Find by ID | `Model.findById(id)` | `Model.findByPk(id)` | `Product.findByPk(5)` |
| Create | `Model.create()` | `Model.create()` | `User.create({...})` |
| Update | `Model.updateOne()` | `Model.update()` | `user.update({name: 'John'})` |
| Delete | `Model.deleteOne()` | `Model.destroy()` | `user.destroy()` |
| Delete Many | `Model.deleteMany()` | `Model.destroy()` | `Otp.destroy({where: {email}})` |
| Count | `Model.countDocuments()` | `Model.count()` | `Product.count({where: {}})` |
| Pagination | `.skip().limit()` | `offset/limit` | `offset: (page-1)*limit, limit` |
| Sort | `.sort({field: -1})` | `order: [['field', 'DESC']]` | `order: [['createdAt', 'DESC']]` |
| Regex search | `{$regex: 'text'}` | `{[Op.like]: '%text%'}` | `where: {name: {[Op.like]: '%search%'}}` |
| ID validation | `mongoose.isValidObjectId(id)` | `!isNaN(Number(id))` | `const numId = Number(id)` |
| Object comparison | `{$ne: id}` | `{[Op.ne]: id}` | `id: {[Op.ne]: userId}` |

---

## 📝 CONTROLLER CONVERSION STEPS

### 1. Order Controller (`backend/src/controllers/order.controller.ts`)

**Changes needed:**
```typescript
// 1. Replace imports
- import mongoose from 'mongoose'
+ import { Op } from 'sequelize'
+ import { sequelize } from '../config/db'

// 2. Replace Model.find() patterns
- Order.find({user: userId}).sort({createdAt: -1})
+ Order.findAll({where: {user: userId}, order: [['createdAt', 'DESC']]})

// 3. Replace .populate()
- Order.findById(id).populate('user')
+ Order.findByPk(id, {include: [{model: User}]})

// 4. Replace ID validation
- mongoose.isValidObjectId(id)
+ !isNaN(Number(id))

// 5. Replace deleteOne()
- Order.deleteOne({_id: id})
+ Order.destroy({where: {id}})
```

---

### 2. Address Controller (`backend/src/controllers/address.controller.ts`)

**Key conversions:**
```typescript
// .find() → findAll()
- Address.find({user: userId})
+ Address.findAll({where: {user: userId}})

// .deleteOne() → destroy()
- Address.deleteOne({_id: id})
+ Address.destroy({where: {id}})

// .sort() → order
- .sort({createdAt: -1})
+ order: [['createdAt', 'DESC']]

// .findOne() with conditions
- Address.findOne({_id: id, user: userId})
+ Address.findOne({where: {id, user: userId}})
```

---

### 3. Admin Controller (`backend/src/controllers/admin.controller.ts`)

**Focus on:**
- All `User.findById()` → `User.findByPk()`
- All `Product.find()` → `Product.findAll()`
- All `Order.find()` → `Order.findAll()`
- Count operations: `.countDocuments()` → `.count()`

---

### 4. Coupon Controller (`backend/src/controllers/coupon.controller.ts`)

**Pattern:**
```typescript
// Create
- Coupon.create({code, value, ...})
+ Coupon.create({code, value, ...})  // Same

// Find all
- Coupon.find()
+ Coupon.findAll()

// Find one
- Coupon.findOne({code})
+ Coupon.findOne({where: {code}})

// Update
- coupon.save()  // After modifying
+ coupon.save()  // Same in Sequelize too
```

---

### 5. Review Controller (`backend/src/controllers/review.controller.ts`)

**Key points:**
```typescript
// Find with relations
- Review.find({product: id}).populate('user')
+ Review.findAll({
+   where: {product: id},
+   include: [{model: User}]
+ })

// Create with validation
- Review.create({product, user, rating, comment})
+ Review.create({product, user, rating, comment})  // Same

// Delete
- Review.deleteOne({_id: id, user: userId})
+ Review.destroy({where: {id, user: userId}})
```

---

### 6. Offer Controller (`backend/src/controllers/offer.controller.ts`)

**Straightforward conversions:**
```typescript
- Offer.find().sort({displayOrder: 1})
+ Offer.findAll({order: [['displayOrder', 'ASC']]})

- Offer.findById(id)
+ Offer.findByPk(id)

- offer.save()
+ offer.save()  // Same
```

---

### 7. Promo Controller (`backend/src/controllers/promo.controller.ts`)

Similar pattern to Offer controller.

---

## 🔧 IMPORTANT FIXES

### Fix 1: Import Statements
Replace in ALL controller files:
```typescript
- import mongoose from 'mongoose'
+ import { Op } from 'sequelize'
```

### Fix 2: Where Clause Pattern
**WRONG:**
```typescript
User.findOne({email: 'test@example.com'})  // Mongoose
```

**RIGHT:**
```typescript
User.findOne({where: {email: 'test@example.com'}})  // Sequelize
```

### Fix 3: Operators
**WRONG:**
```typescript
{_id: {$ne: userId}}  // MongoDB
```

**RIGHT:**
```typescript
{id: {[Op.ne]: userId}}  // Sequelize
import { Op } from 'sequelize'  // Add import
```

### Fix 4: Pagination
**WRONG:**
```typescript
.skip(10).limit(20)  // Mongoose
```

**RIGHT:**
```typescript
offset: 10, limit: 20  // Sequelize
```

---

## 🧪 TESTING CHECKLIST

After converting all controllers:

- [ ] User registration works
- [ ] User login works
- [ ] Can create products
- [ ] Can fetch products with filtering
- [ ] Can place orders
- [ ] Can view order history
- [ ] Can add/remove addresses
- [ ] Can create reviews
- [ ] Can apply coupons
- [ ] Admin dashboard works

---

## 🚀 DEPLOYMENT STEPS

1. **Test locally with MySQL:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test all API endpoints** with Postman/Thunder Client

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Complete MongoDB to MySQL migration"
   git push origin master
   ```

4. **Deploy to Render:**
   - Update environment variables with MySQL credentials
   - Trigger redeploy

5. **Test in production**

---

## 📚 Reference

**Sequelize Documentation:** https://sequelize.org
**Op Operators:** https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#operators

---

## ✨ SUMMARY

Total controllers to convert: 7
- [x] Auth (Done)
- [x] Product (Done)
- [ ] Order
- [ ] Address
- [ ] Admin
- [ ] Coupon
- [ ] Review
- [ ] Offer
- [ ] Promo

Follow the patterns above and all controllers will be Sequelize-compatible!
