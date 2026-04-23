# Ewara Cosmetics - API Documentation

## Overview
Complete API reference for Ewara Cosmetics e-commerce platform.

---

## 📋 Frontend API Routes

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "message": "Frontend API running"
}
```

### Stripe Checkout
```
POST /api/checkout
```
**Request:**
```json
{
  "items": [
    {
      "id": "product-1",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 2,
      "image": "https://..."
    }
  ],
  "customerEmail": "user@example.com"
}
```

**Response (Success):**
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

---

## 📋 Backend API Routes

### Authentication

#### Register
```
POST /api/auth/register
```
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```
POST /api/auth/login
```
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

### Products

#### Get All Products
```
GET /api/products
```

**Query Parameters:**
- `category` (optional): Filter by category
- `sort` (optional): Sort order (newest, price-asc, price-desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-1",
      "name": "Face Serum",
      "category": "skincare",
      "price": 49.99,
      "image": "url",
      "stock": 100
    }
  ]
}
```

#### Get Product Details
```
GET /api/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product-1",
    "name": "Face Serum",
    "category": "skincare",
    "price": 49.99,
    "description": "...",
    "image": "url",
    "stock": 100
  }
}
```

---

### Orders

#### Get User Orders
```
GET /api/orders
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-1",
      "userId": "user-id",
      "items": [...],
      "total": 99.99,
      "status": "completed",
      "paymentMethod": "stripe",
      "createdAt": "2026-04-24T10:00:00Z"
    }
  ]
}
```

#### Get Order Details
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>
```

#### Create Order
```
POST /api/orders
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "items": [
    {
      "productId": "product-1",
      "quantity": 2,
      "price": 49.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "NYC",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe"
}
```

---

## 🔐 Authentication

All protected endpoints require:
```
Headers: Authorization: Bearer <jwt-token>
```

Token obtained from login endpoint. Store in localStorage:
```javascript
localStorage.setItem('token', token);
```

---

## ⚡ Error Handling

Standard error response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "error-code"
}
```

Common status codes:
- `200` - Success
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

---

## 🌐 Environment URLs

**Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

**Production:**
- Frontend: `https://ewara-cosmetics.vercel.app`
- Backend: `https://ewara-api.herokuapp.com` (or your deploy URL)

---

## 🧪 Testing with cURL

```bash
# Test health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "pass123"
  }'

# Get products
curl http://localhost:5000/api/products

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "pass123"
  }'
```

---

## 📞 Support

For issues or questions:
1. Check error response message
2. Verify request format
3. Check authentication token validity
4. Review this documentation

