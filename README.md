# Ewara Cosmetics 💄

A premium e-commerce platform for cosmetics featuring a modern UI, secure payment processing, and comprehensive product management.

## 🌟 Features

- **User Authentication** - JWT-based secure authentication
- **Product Catalog** - Browse beauty products by category
- **Shopping Cart** - Persistent cart with Zustand state management
- **Stripe Payments** - Secure payment processing with Stripe
- **Order Tracking** - Real-time order status updates
- **Admin Dashboard** - Manage products and orders
- **Responsive Design** - Beautiful UI with Tailwind CSS
- **API Integration** - RESTful backend with Express.js

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Payments**: Stripe
- **HTTP Client**: Axios
- **UI Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Express middleware
- **Email**: Nodemailer

## 📦 Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB running locally or MongoDB Atlas connection

### Frontend Setup

```bash
cd 'c:\Ewara codes'
npm install
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

```bash
cd 'c:\Ewara codes\backend'
npm install
npm run dev
```

Server runs on `http://localhost:5000`

## 🔑 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ewara
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NODE_ENV=development
```

## 🚀 Getting Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Sign up or login
3. Navigate to Developers → API Keys
4. Copy Publishable Key (pk_test_) and Secret Key (sk_test_)
5. Add to your `.env` files

**⚠️ Important**: Use test keys for development, not live keys!

## 📁 Project Structure

```
c:\Ewara codes/
├── app/                 # Next.js app directory
├── backend/             # Express backend
├── components/          # React components
├── store/              # Zustand stores
├── lib/                # Utilities & API client
├── utils/              # Helper functions
├── public/             # Static assets
└── package.json        # Frontend dependencies
```

## 📚 Available Scripts

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier
npm run type-check # Check TypeScript types
npm run test       # Run tests with Vitest
npm run test:ui    # Run tests with UI
```

### Backend
```bash
npm run dev        # Start dev server with hot reload
npm run build      # Build TypeScript
npm run start      # Run production build
```

## 🧪 Testing the Flow

1. **Register**: Create account at `/register`
2. **Browse**: View products at `/shop`
3. **Cart**: Add items to cart (persists to localStorage)
4. **Checkout**: Complete Stripe test payment
5. **Confirmation**: View order at `/orders`

## 🔐 Security

- ✅ CORS protection configured
- ✅ JWT authentication
- ✅ Security headers enabled
- ✅ Input validation
- ✅ Environment variables hidden

## 📝 API Documentation

See [API_DOCS.md](API_DOCS.md) for complete API reference including:
- Authentication endpoints
- Product endpoints
- Order endpoints
- Stripe webhook handling

## 🐛 Troubleshooting

### Port Already in Use
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
Ensure MongoDB is running:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Stripe Test Mode
Always use `pk_test_` and `sk_test_` keys for development!

## 📊 Project Completion Status

Current: **~60% Complete**

✅ Completed:
- Git repository
- Frontend & backend structure
- Database models
- API endpoints
- Authentication system
- Stripe checkout integration
- State management (Zustand)
- Security headers
- npm scripts

⏳ In Progress:
- Frontend Stripe UI components
- Order tracking features
- Admin dashboard refinements

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a pull request

## 📞 Support

For issues or questions:
1. Check API_DOCS.md
2. Review error messages in console
3. Check environment variables
4. Verify MongoDB connection

## 📄 License

Private - Ewara Cosmetics

---

**Happy coding! 🚀**

