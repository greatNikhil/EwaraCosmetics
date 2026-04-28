# Vercel Frontend Deployment Guide

## Prerequisites
- GitHub account with code pushed
- Vercel account (https://vercel.com)
- Backend deployed on Render (https://ewara-cosmetics1.onrender.com)

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

## Step 2: Deploy via Vercel Dashboard (Easiest Method)

### Option A: Using Vercel UI (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Connect your GitHub account
5. Select repository: `Ewara-Cosmetics1`
6. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
7. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
vercel login
cd c:\Ewara codes
vercel
```

Follow the prompts to deploy.

## Step 3: Configure Environment Variables in Vercel

After deployment, configure environment variables:

1. Go to **Project Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://ewara-cosmetics1.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your actual Razorpay key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your actual Stripe key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret (backend only if needed) |
| `STRIPE_SECRET_KEY` | Your Stripe secret (backend only if needed) |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |

3. Click **"Save"** 
4. Re-deploy: **Deployments** → **Click latest** → **Redeploy**

## Step 4: Update vercel.json (Already Done!)

Your `vercel.json` is already configured with:
- ✅ Build command: `npm run build`
- ✅ Output directory: `.next`
- ✅ Backend API URL: `https://ewara-cosmetics1.onrender.com`

## Step 5: Configure CORS on Render Backend

Ensure your Render backend has CORS configured for Vercel domain:

```javascript
cors({
  origin: [
    "https://your-vercel-app.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
})
```

## Step 6: Test Deployment

1. Visit your Vercel URL (assigned after deployment)
2. Test login/register (connects to Render backend)
3. Check Network tab for correct API URL
4. Test payment integrations

## Automatic Deployments

**Enabled by default!** Every push to `master` branch auto-deploys to production.

**To manage:**
- Dashboard → Settings → Git → Auto-deploy

## Custom Domain (Optional)

1. Dashboard → Settings → Domains
2. Add custom domain
3. Update DNS records
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Monitoring & Logs

- **Build logs:** Deployments tab → Click deployment
- **Runtime errors:** Functions tab
- **Analytics:** Analytics tab

## Troubleshooting

### Build fails: "Cannot find module"
→ Check dependencies in package.json

### API calls fail after deployment
→ Verify `NEXT_PUBLIC_API_URL` environment variable is set

### Payments not working
→ Verify Razorpay/Stripe keys in environment variables

## Deployment Status

**Frontend:** https://your-app.vercel.app (will be assigned)
**Backend:** https://ewara-cosmetics1.onrender.com

## Benefits of Vercel

✅ Zero-config Next.js deployment
✅ Automatic HTTPS
✅ Edge functions support
✅ Built-in analytics
✅ Automatic re-deployments on push
✅ Free tier with generous limits
✅ Seamless Git integration

## Next Steps

1. ✅ Go to https://vercel.com
2. ✅ Sign up/Login
3. ✅ Import Ewara-Cosmetics1 repository
4. ✅ Set environment variables
5. ✅ Deploy!

Your site will be live in minutes! 🚀
