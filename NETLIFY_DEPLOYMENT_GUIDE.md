# Netlify Frontend Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Netlify account (https://netlify.com)
- Backend deployed on Render with a working API URL

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin master
```

## Step 2: Create netlify.toml Configuration

Add a `netlify.toml` file in your project root with the following content:

```toml
[build]
  command = "npm run build"
  publish = ".next/out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  NEXT_PUBLIC_API_URL = "https://your-backend-url.onrender.com"
  NEXT_PUBLIC_APP_URL = "https://your-frontend-url.netlify.app"
  NEXT_PUBLIC_RAZORPAY_KEY_ID = "your_razorpay_key"
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "your_stripe_key"
  NEXT_PUBLIC_GOOGLE_CLIENT_ID = "your_google_client_id"
```

## Step 3: Connect to Netlify

### Option A: Using Netlify UI (Recommended for Beginners)

1. Go to https://app.netlify.com
2. Click **"New site from Git"**
3. Connect your GitHub account
4. Select your repository: `Ewara-Cosmetics1`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click **"Deploy site"**

### Option B: Using Netlify CLI (Advanced)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd c:\Ewara codes
netlify deploy --prod
```

## Step 4: Configure Environment Variables in Netlify

1. Go to your site settings in Netlify
2. Navigate to **Site settings → Build & deploy → Environment**
3. Add these variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`)
   - `NEXT_PUBLIC_APP_URL`: Your Netlify site URL
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your Razorpay key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe key
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

## Step 5: Important Configuration for Next.js on Netlify

Your Next.js app needs proper build configuration. Update or create `.nvmrc` to specify Node version:

```
18.17.0
```

Or use `18.20.0` or later.

## Step 6: Configure CORS on Render Backend

Ensure your Render backend has CORS configured to allow requests from your Netlify domain:

```javascript
// In your backend (Express.js example)
cors({
  origin: [
    "https://your-frontend-url.netlify.app",
    "http://localhost:3000"
  ],
  credentials: true
})
```

## Step 7: Update API Calls

Make sure all your API calls use the environment variable:

```typescript
// Example in your lib/api.ts or utils/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});
```

## Troubleshooting

### Build Fails: "Cannot find module"
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Fails: Dependency conflicts
Use `npm install --legacy-peer-deps` in Netlify build command if needed.

### API Calls Fail After Deployment
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS configuration on your backend
- Ensure backend is running on Render

### Static Assets Not Loading
- Make sure `public/` folder is committed to git
- Verify paths use `/` not relative paths

## Monitoring & Logs

1. View build logs in Netlify: **Site settings → Deploys**
2. View function logs: **Site settings → Functions**
3. Check real-time logs during deployment

## Domain Configuration

To use a custom domain:
1. Go to **Site settings → Domain management**
2. Add custom domain
3. Follow DNS configuration steps (depends on your registrar)
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Redeployment

The site automatically redeploys when you push to `master` branch. To manually redeploy:
- In Netlify UI: **Deploys → Trigger deploy**
- Or push a commit to trigger automatic redeploy

## Next Steps

1. ✅ Create netlify.toml (see Step 2)
2. ✅ Push code to GitHub
3. ✅ Connect to Netlify (Step 3)
4. ✅ Set environment variables (Step 4)
5. ✅ Configure backend CORS (Step 6)
6. ✅ Monitor first deployment

