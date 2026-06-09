# 📊 LOCALSTORAGE USAGE AUDIT & BACKEND MIGRATION PLAN

**Date:** April 24, 2026  
**Status:** Migration Required  
**Issue:** Addresses deleted on re-login to different profile

---

## 🔍 CURRENT LOCALSTORAGE USAGE

### ✅ What's Currently in LocalStorage:

| Item | Location | Data | Issue |
|------|----------|------|-------|
| **token** | `app/login/page.tsx` | JWT auth token | ✅ Fine (temporary) |
| **userData** | `app/login/page.tsx` + `app/profile/page.tsx` | User profile object | ❌ **SHOULD BE BACKEND** |
| **isLoggedIn** | `app/login/page.tsx` | Boolean flag | ✅ Fine (temporary) |
| **isAdmin** | `app/login/page.tsx` | Boolean flag | ✅ Fine (temporary) |
| **auth-storage** | `store/authStore.ts` (Zustand) | User + token | ✅ Zustand persisted |
| **cart-storage** | `store/cartStore.ts` (Zustand) | Cart items | ⚠️ **Mixed (local + backend)** |
| **wishlistItems** | `utils/wishlist.ts` | Wishlist products | ❌ **SHOULD BE BACKEND** |

---

## ❌ PROBLEM: Why Addresses Get Deleted

**Current Flow:**
1. User A logs in → addresses loaded from backend → stored in local state
2. User A logs out
3. User B logs in
4. localStorage["userData"] gets overwritten
5. User A's addresses are lost in local state
6. **But they're still in MongoDB** ← The real issue is state management

**Root Cause:**
- Addresses are fetched from backend (`GET /api/addresses`)
- Stored in local React state (`setAddresses()`)
- When logging out/in with different user, state is cleared
- **Addresses are in MongoDB but UI doesn't load them properly on re-login**

---

## 🎯 WHAT NEEDS BACKEND MIGRATION

### **Priority 1: CRITICAL (Causing Address Issue)**

#### **1. Wishlist Items**
```
Current: localStorage["wishlistItems"]
File: utils/wishlist.ts

Should Be:
- New collection: wishlists (MongoDB)
- API endpoints:
  GET    /api/wishlists           - Get user's wishlist
  POST   /api/wishlists           - Add item to wishlist
  DELETE /api/wishlists/:itemId   - Remove item
  PUT    /api/wishlists/:itemId   - Update wishlist item
```

#### **2. Shopping Cart**
```
Current: localStorage["cart-storage"] (Zustand persisted)
File: store/cartStore.ts

Should Be:
- New collection: carts (MongoDB)
- API endpoints:
  GET    /api/carts              - Get user's cart
  POST   /api/carts              - Add item to cart
  DELETE /api/carts/:itemId      - Remove item
  PUT    /api/carts/:itemId      - Update quantity

Backend sync needed:
- When user adds item → sync to backend
- When user logs in → fetch from backend, not localStorage
```

#### **3. Address Management (FIX THIS NOW)**
```
Current: Fetching from /api/addresses correctly ✅
Issue: Not being synced to authStore properly

Fix:
- Add addresses to authStore alongside user data
- When fetching addresses, update authStore
- When logging in new user, properly refetch addresses

Problem Code in app/profile/page.tsx:
  const fetchAddresses = async (token: string) => {
    // ✅ Fetches from backend
    // ❌ But doesn't sync to user-specific state
  }
```

---

### **Priority 2: MEDIUM (Good to Move)**

#### **4. User Data Stored in localStorage**
```
Current: localStorage["userData"] = JSON.stringify(user)
Files:
  - app/login/page.tsx (line 59)
  - app/profile/page.tsx (line 105)

Issue:
- userData includes addresses object
- Gets overwritten on different user login
- Should be in authStore only, not both localStorage + authStore

Solution:
- Remove localStorage["userData"]
- Keep only in Zustand authStore
- authStore already has persist middleware
```

---

## ✅ WHAT'S FINE IN LOCALSTORAGE

### **Temporary Auth Data (OK to keep)**
```
- token              ✅ Temporary, expires
- isLoggedIn        ✅ Session flag
- isAdmin           ✅ Role check
- auth-storage      ✅ Zustand handles it with expire
```

---

## 🛠️ IMPLEMENTATION ROADMAP

### **Phase 1: Fix Address Issue (Today)**

**Step 1: Update Profile Page**
```typescript
// app/profile/page.tsx

const fetchAddresses = async (token: string) => {
  const res = await fetch(buildApiUrl("/api/addresses"), {...});
  const data = await res.json();
  
  // ✅ ADD THIS: Sync to authStore
  useAuthStore.setState(state => ({
    user: { ...state.user, addresses: data.addresses }
  }));
  
  return data.addresses;
};
```

**Step 2: Update Login Page**
```typescript
// app/login/page.tsx

// When login succeeds:
const token = data.token;
const normalizedUser = data.user;

// ✅ Fetch addresses immediately
const addressRes = await fetch(`/api/addresses`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { addresses } = await addressRes.json();

// ✅ Store user WITH addresses
useAuthStore.setUser({
  ...normalizedUser,
  addresses: addresses || []
});
useAuthStore.setToken(token);

// ❌ REMOVE THIS:
// localStorage.setItem("userData", JSON.stringify(...))
```

### **Phase 2: Backend API Endpoints (This Week)**

**1. Create Wishlist Endpoints**
```
POST /api/wishlists/add          - Add to wishlist
POST /api/wishlists/remove       - Remove from wishlist
GET  /api/wishlists              - Get user's wishlist
```

**2. Create Cart Endpoints**
```
POST /api/carts/add              - Add to cart
POST /api/carts/update           - Update quantity
POST /api/carts/remove           - Remove item
GET  /api/carts                  - Get user's cart
DELETE /api/carts                - Clear cart
```

**3. Enhance Address Endpoints**
```
✅ Already exists:
GET  /api/addresses              - Get all
POST /api/addresses              - Create new
PUT  /api/addresses/:id          - Update
DELETE /api/addresses/:id        - Delete
```

### **Phase 3: Frontend Sync (Next Week)**

**1. Cart Store Update**
```typescript
// store/cartStore.ts

export const useCartStore = create<CartStore>()(
  persist((set, get) => ({
    // ... existing code ...
    syncToBackend: async (token: string) => {
      // POST current cart to backend
    },
    syncFromBackend: async (token: string) => {
      // GET cart from backend and update local state
    }
  }))
);
```

**2. Wishlist API Wrapper**
```typescript
// utils/wishlistApi.ts (NEW)

export const wishlistApi = {
  add: async (productId: string, token: string) => { ... },
  remove: async (itemId: string, token: string) => { ... },
  getAll: async (token: string) => { ... }
};
```

---

## 📋 FILES TO UPDATE

### **Immediate (Today)**
1. `app/login/page.tsx` - Add address fetch after login
2. `app/profile/page.tsx` - Better address state management
3. `store/authStore.ts` - Add addresses field to User interface

### **Backend (This Week)**
1. Create `backend/src/routes/wishlist.routes.ts`
2. Create `backend/src/routes/cart.routes.ts`
3. Create `backend/src/models/Wishlist.ts`
4. Create `backend/src/models/Cart.ts`

### **Frontend (Next Week)**
1. `utils/wishlistApi.ts` - Backend API wrapper
2. `utils/cartApi.ts` - Backend API wrapper
3. `store/cartStore.ts` - Add sync methods
4. `app/wishlist/page.tsx` - Load from backend on mount
5. `app/cart/page.tsx` - Load from backend on mount
6. Remove localStorage direct calls in wishlist.ts

---

## 🔑 KEY CHANGES NEEDED

### **Before (Current Issue)**
```
User Logs In → Load Data → Store in localStorage & State
User B Logs In → localStorage Overwritten → User A data lost
```

### **After (Fixed)**
```
User Logs In → Fetch ALL data from Backend → Store in authStore
User B Logs In → Clear authStore → Fetch User B data from Backend
User A Logs In Again → Fetch User A data from Backend (intact in DB)
```

---

## 📊 LOCALSTORAGE CLEANUP SUMMARY

| Item | Current | Action | New Location |
|------|---------|--------|--------------|
| token | localStorage | Keep | localStorage + authStore |
| userData | localStorage | Remove | authStore only |
| isLoggedIn | localStorage | Keep | localStorage |
| isAdmin | localStorage | Keep | localStorage |
| auth-storage | Zustand | Enhance | Add addresses field |
| cart-storage | localStorage | Move | Backend API + reduced localStorage |
| wishlistItems | localStorage | Move | Backend API |

---

## ⏱️ ESTIMATED TIMELINE

- **Today**: Fix address sync issue (30 min)
- **This Week**: Implement backend APIs (4-6 hours)
- **Next Week**: Frontend sync implementation (4-6 hours)

---

## 🎯 FINAL GOAL

```
✅ NO data deleted on re-login
✅ Sync across devices
✅ Persistent across sessions
✅ Multi-user safe
✅ Zero localStorage conflicts
```

All user-specific data → Backend (MongoDB)
All UI state → Zustand authStore
Only session tokens → localStorage (temporary)
