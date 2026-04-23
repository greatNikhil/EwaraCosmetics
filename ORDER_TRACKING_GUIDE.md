# Order Tracking System - Complete Guide

## 🎯 Overview

A complete, production-ready order tracking system for the Ewara Cosmetics e-commerce website. Features include:

- ✅ Order listing with Flipkart-like UI
- ✅ Order details with delivery tracker
- ✅ PDF invoice generation
- ✅ Review system
- ✅ Return policy
- ✅ WhatsApp support integration
- ✅ Profile integration
- ✅ localStorage-based (easily swappable with backend API)

---

## 📁 File Structure

```
app/
├── orders/
│   ├── page.tsx                 # Main orders list page
│   └── [id]/
│       └── page.tsx             # Order details & tracker
├── profile/
│   └── page.tsx                 # (Updated with orders sections)

components/
└── orders/
    ├── OrderCard.tsx            # Order list item component
    └── OrderTracker.tsx         # Visual delivery tracker

hooks/
└── useOrders.ts                 # Custom hook for order management

utils/
├── orderUtils.ts                # Order types & utilities
└── sampleOrders.ts              # Sample data generator
```

---

## 🚀 Quick Start

### 1. Login First

Visit `/login` or `/register` and create/login to an account. The system uses the logged-in user's email to fetch their orders.

### 2. Create Sample Orders (Testing)

#### Option A: Browser Console

```javascript
// Run in browser console after logging in
const userData = localStorage.getItem("userData");
const user = JSON.parse(userData);
const userEmail = user.email;

const sampleOrder = {
  id: "ORD-TEST-001",
  invoiceNumber: "INV-TEST-001",
  items: [
    {
      id: "1",
      productId: "prod1",
      productName: "Luxury Face Serum",
      imageUrl: "/Product/product1.jpg",
      price: 1299,
      quantity: 1,
    },
  ],
  status: "delivered",
  date: new Date().toISOString(),
  deliveryDate: new Date().toISOString(),
  totalAmount: 1299,
  discountAmount: 0,
  gst: 234,
  shippingAddress: {
    name: user.name || "Customer",
    address: "123 Main St",
    city: "Delhi",
    state: "Delhi",
    pin: "110001",
    phone: user.phone || "9876543210",
  },
  billingAddress: null,
  paymentMethod: "Credit Card",
};

const orders = JSON.parse(localStorage.getItem(`orders_${userEmail}`)) || [];
orders.push(sampleOrder);
localStorage.setItem(`orders_${userEmail}`, JSON.stringify(orders));
window.dispatchEvent(new Event("storage"));
```

#### Option B: Programmatic

Add this to a component or page:

```typescript
import { createSampleOrders } from "@/utils/sampleOrders";

// Call in useEffect or button click
createSampleOrders();
```

### 3. Navigate to Orders Page

Visit `/orders` to see the main orders list.

---

## 📄 Pages & Routes

### `/orders` - Main Orders List

**Features:**

- Shows all user orders
- Login redirect if not authenticated
- "No Orders Yet" state with shop button
- Each order card shows:
  - Product image
  - Product name
  - Status badge (Delivered/Shipped/Placed/Cancelled)
  - Order total price
  - Order date
  - "View Details" button

**Styling:** Luxury theme with hover lift effects and animations

### `/orders/[id]` - Order Details

**Layout:**

![Layout](Three columns responsive)

```
LEFT SIDE (66%)          RIGHT SIDE (33%)
┌─────────────────────┐  ┌──────────────────┐
│ Product Image       │  │ Order ID         │
├─────────────────────┤  ├──────────────────┤
│ Product Details     │  │ Delivery Details │
├─────────────────────┤  ├──────────────────┤
│ Delivery Tracker    │  │ Price Breakdown  │
│ (3-step timeline)   │  ├──────────────────┤
├─────────────────────┤  │ Payment Method   │
│ Return Policy       │  ├──────────────────┤
├─────────────────────┤  │ Download Invoice │
│ Support & Review    │  └──────────────────┘
└─────────────────────┘
```

**Features:**

1. **Delivery Tracker** (3-Step Timeline)
   - Order Placed (always complete)
   - Shipped (shows delivery partner + tracking info)
   - Delivered (shows confirmation)
   - Visual indicator: colored circles on timeline
   - Active status highlighted in maroon (#7a1f2b)
   - Cancelled orders show special message

2. **Return Policy Section**
   - 7-day return policy details
   - Product condition requirements
   - Expiry date requirements
   - Allergic reaction handling

3. **Support & Reviews**
   - WhatsApp integration button
   - 5-star review form (for delivered orders)
   - Review submission ready for backend

4. **Invoice Download**
   - Generates PDF with all order details
   - Includes billing & shipping addresses
   - Shows itemized product list
   - Displays price breakdown and total
   - Uses browser print dialog (easily upgradable to jsPDF)

---

## 🎨 Design System

### Colors

- **Primary:** #7a1f2b (Maroon)
- **Secondary:** #f7e9e7 (Soft Pink)
- **Background:** #fdf8f6 (Off-white)
- **Text:** #4a1a1f (Dark Maroon)
- **Status Colors:**
  - Delivered: #10b981 (Green)
  - Shipped: #f59e0b (Orange)
  - Placed: #3b82f6 (Blue)
  - Cancelled: #ef4444 (Red)

### Components

- Rounded corners: 20-32px (rounded-[20px] to rounded-[32px])
- Shadows: Soft, double-layer effects
- Spacing: Generous luxury spacing
- Typography: Semibold headings, medium body text

---

## 🔧 Data Structure

### Order Interface

```typescript
interface Order {
  id: string; // Unique order ID
  invoiceNumber: string; // Invoice reference
  items: OrderItem[]; // Array of products
  status: "placed" | "shipped" | "delivered" | "cancelled";
  date: string; // ISO date string
  deliveryDate?: string; // ISO date string
  totalAmount: number; // Final total in rupees
  discountAmount?: number; // Discount applied
  gst?: number; // GST amount (18%)
  shippingAddress: Address; // Delivery address
  billingAddress?: Address; // Billing address
  paymentMethod: string; // Payment method used
  trackingNumber?: string; // Courier tracking number
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  discount?: number;
}

interface Address {
  name: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
}
```

### localStorage Keys

- `orders_${userEmail}` - Array of Order objects for the user

---

## 🪝 Hooks

### `useOrders()`

```typescript
const { orders, user, loading } = useOrders();
```

**Returns:**

- `orders` (Order[]) - All orders for current user
- `user` (any) - Current logged-in user
- `loading` (boolean) - Loading state

**Features:**

- Auto-listens to localStorage changes
- Syncs across browser tabs
- Re-renders on user/order changes

---

## 🛠️ Utilities

### Order Functions

#### `getOrdersForUser(userEmail)`

Fetches all orders for a user from localStorage.

#### `saveOrder(userEmail, order)`

Saves or updates a single order.

#### `getOrderById(userEmail, orderId)`

Fetches a specific order.

#### `generateInvoicePDF(order)`

Generates and opens invoice PDF in print dialog.

#### Helper Functions

- `formatCurrency(amount)` - Formats to ₹X.XX
- `formatDate(dateString)` - Formats to locale date
- `getStatusColor(status)` - Returns color for status
- `getStatusLabel(status)` - Returns capitalized status label

---

## 🔌 Backend Integration

### Replacing localStorage with API calls

All functions in `orderUtils.ts` can be easily modified to use API:

```typescript
// Before (localStorage)
export const getOrdersForUser = (userEmail: string) => {
  const stored = localStorage.getItem(`orders_${userEmail}`);
  return stored ? JSON.parse(stored) : [];
};

// After (API)
export const getOrdersForUser = async (userEmail: string) => {
  const res = await fetch(`/api/orders?email=${userEmail}`);
  return res.json();
};
```

### API Endpoints to Create

- `GET /api/orders` - List all user orders
- `GET /api/orders/[id]` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/[id]` - Update order status
- `POST /api/orders/[id]/review` - Submit review

---

## 📱 Profile Integration

### Profile Dashboard - Overview Tab

Shows:

- Latest 2 orders with quick preview
- Order total and status
- "See All Orders" link if more than 2

### Profile Dashboard - My Orders Tab

Shows:

- All user orders
- Same card layout as `/orders` page
- Full order management

---

## ✨ Features & Animations

### Animations

- **Fade-up on scroll:** Order cards fade in from bottom
- **Hover lift:** Cards lift on hover with shadow increase
- **Smooth transitions:** All state changes are animated
- **Staggered animation:** Multiple items animate with delay

### Interactions

- **Clickable cards:** Order cards link to details page
- **Status badges:** Colored badges indicate order state
- **Tracker animation:** Step indicators highlight active step
- **Form validation:** Review form validates input

---

## 🧪 Testing Checklist

- [ ] Login and verify orders list is empty
- [ ] Create sample orders using console
- [ ] Verify orders appear in `/orders`
- [ ] Click order to view details
- [ ] Check tracker shows correct status
- [ ] Test delivery address display
- [ ] Verify price breakdown
- [ ] Click "Download Invoice" - PDF should open
- [ ] Leave a review and verify form works
- [ ] Check WhatsApp link opens
- [ ] Go to profile and verify My Orders tab
- [ ] Check profile Overview shows latest orders
- [ ] Test on mobile responsive

---

## 🐛 Troubleshooting

### Orders Not Showing

1. Verify user is logged in: `localStorage.getItem("userData")`
2. Check orders exist: `localStorage.getItem("orders_[email]")`
3. Verify orderStructure matches interface
4. Check browser console for errors

### Animations Not Working

1. Ensure `animate-fadeUp` class is in globals.css (already added)
2. Check Tailwind config has animation enabled
3. Clear browser cache if updates not showing

### PDF Download Issues

1. Check browser allows pop-ups
2. Ensure order has all required fields
3. Try opening in private/incognito mode

---

## 📞 Support Integration

### WhatsApp Integration

Current: Hardcoded to https://wa.me/919876543210

To update:

```typescript
// In app/orders/[id]/page.tsx line ~280
href = "https://wa.me/91XXXXXXXXXX"; // Replace with actual number
```

---

## ♻️ Future Enhancements

- [ ] Invoice PDF using jsPDF library (better formatting)
- [ ] Email receipt sending
- [ ] Order status push notifications
- [ ] Rating system integration
- [ ] Return request functionality
- [ ] Reorder quick action
- [ ] Order filters (by status, date, amount)
- [ ] Order search functionality
- [ ] Subscription order management

---

## 📝 Notes

- All components are fully responsive (mobile-first design)
- TypeScript throughout for type safety
- No external dependencies needed (except lucide-react already used)
- All styling uses Tailwind CSS utility classes
- Luxury theme maintained throughout
- Animations use CSS keyframes defined in globals.css
