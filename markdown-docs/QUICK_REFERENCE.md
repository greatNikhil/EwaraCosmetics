# ⚡ QUICK START COMMAND REFERENCE

## Copy-Paste Ready Commands

### PHASE 1: Git & ESLint (Run in PowerShell)
```powershell
# Step 1: Initialize Git
cd 'c:\Ewara codes'
git init
git config user.email "dev@ewara.com"
git config user.name "Ewara Dev"
git add .
git commit -m "Initial commit: Project setup"

# Step 3: Create .env.example files
# (Do manually - see below)

# Step 4: Install ESLint & Prettier
npm install --save-dev eslint prettier eslint-config-next @types/eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### PHASE 2: Frontend Setup
```powershell
# Step 8: Install Zustand & other deps (do this early)
npm install zustand react-hot-toast clsx
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react
```

### PHASE 3 & 4: Stripe + Zustand
```powershell
# Step 9: Install Stripe
npm install stripe @stripe/react-js

# Step 14 already covered above
```

---

## 📁 Files to Create Today

### 1. `.env.local` (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. `.env.example` (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. `backend/.env.example`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ewara
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 4. `.gitignore` (Update/Create)
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/
.next/
out/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.chrome-pdf-profile/
```

### 5. `lib/api.ts` (API Client)
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 6. `store/cartStore.ts` (Zustand Store)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### 7. `store/authStore.ts` (Zustand Auth)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 8. `.eslintrc.json` (ESLint Config)
```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@next/next/no-html-link-for-pages": "off",
    "react-hooks/rules-of-hooks": "error"
  }
}
```

### 9. `.prettierrc.json` (Prettier Config)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 10. Update `next.config.mjs` (Security Headers)
```javascript
const nextConfig = {
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 11. `app/api/health/route.ts` (Health Check)
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'ok', message: 'Frontend API running' },
    { status: 200 }
  );
}
```

---

## 🎯 Priority npm Scripts to Add

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## 🔑 Get Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Sign in or create account
3. Go to Developers → API Keys
4. Copy:
   - Publishable Key: `pk_test_xxx`
   - Secret Key: `sk_test_xxx`
5. Add to `.env.local` and backend `.env`

**IMPORTANT:** Use `pk_test_` and `sk_test_` keys (NOT live keys)

---

## ✅ Testing Commands

```powershell
# Test frontend API connection
Invoke-WebRequest -Uri http://localhost:3000/api/health

# Test backend
Invoke-WebRequest -Uri http://localhost:5000

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Run tests
npm run test
```

---

## 🐛 Common Issues & Fixes

### Issue: `ENOENT: no such file or directory`
**Fix:** Run `npm install` in both root and backend folders

### Issue: Port already in use
**Fix:** Kill process on port 3000 or 5000
```powershell
# Find process on port 3000
netstat -ano | findstr :3000
# Kill it (replace PID)
taskkill /PID <PID> /F
```

### Issue: CORS errors
**Fix:** Verify backend `.env` has `NEXT_PUBLIC_API_URL` matching
Make sure backend has `cors()` middleware enabled

### Issue: Stripe key not working
**Fix:** Make sure you're using **TEST** keys, not live keys
Live keys start with `pk_live_` and `sk_live_`

---

## 📊 Progress Tracker

Print this out or keep it visible:

```
09:00 | Phase 1: Git & ESLint             [ ] 30 min
09:30 | Phase 2: Frontend Setup           [ ] 45 min
10:30 | Phase 3: Stripe Integration       [ ] 90 min
10:30 | Phase 4: Zustand (parallel)       [ ] 45 min
12:00 | LUNCH
13:00 | Phase 5: Security Hardening       [ ] 25 min
13:25 | Phase 6: Testing & Docs           [ ] 30 min
13:55 | Phase 7: Final Setup & Commit     [ ] 15 min
14:10 | Testing & Verification            [ ] 20 min
```

Tick off each box as you complete!

