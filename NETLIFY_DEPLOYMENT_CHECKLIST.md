# Netlify Frontend Deployment Checklist

## Before Deployment

- [ ] Backend is deployed on Render and API is working
- [ ] Get your Render backend URL (e.g., https://your-app.onrender.com)
- [ ] All code is committed and pushed to GitHub master branch
- [ ] Have your API keys ready:
  - [ ] Razorpay Key ID
  - [ ] Stripe Publishable Key
  - [ ] Google OAuth Client ID

## Steps to Deploy

### 1. Update netlify.toml
- [ ] Replace `your-render-backend-url.onrender.com` with your actual Render URL
- [ ] Customize environment variables with your keys
- [ ] Commit and push: `git push origin master`

### 2. Create Netlify Account
- [ ] Sign up at https://netlify.com (free account available)
- [ ] Verify email

### 3. Deploy via GitHub
- [ ] Click "New site from Git"
- [ ] Connect GitHub account
- [ ] Select `Ewara-Cosmetics1` repository
- [ ] Build settings:
  - Build command: `npm run build`
  - Publish directory: `.next`
- [ ] Click Deploy

### 4. Configure Environment Variables in Netlify UI
After initial deploy, go to Site settings:
- [ ] Navigate to **Build & deploy → Environment**
- [ ] Add/verify all `NEXT_PUBLIC_*` variables match netlify.toml
- [ ] Redeploy site

### 5. Test Deployment
- [ ] Visit your Netlify site URL
- [ ] Test login/register (should connect to Render backend)
- [ ] Test API calls (check Network tab for correct API URL)
- [ ] Check console for errors

### 6. Configure Custom Domain (Optional)
- [ ] Go to **Domain management**
- [ ] Add custom domain
- [ ] Update DNS records at your registrar
- [ ] Update `NEXT_PUBLIC_APP_URL` if using custom domain

## Common Issues & Solutions

### Deploy fails with dependency error
→ Use `--legacy-peer-deps` flag in build command (already fixed in package.json)

### API calls fail after deployment
→ Check that `NEXT_PUBLIC_API_URL` environment variable is set correctly

### Static assets return 404
→ Ensure public/ folder is in git repository

### Pages show 404 errors
→ Verify redirect rule in netlify.toml is present

## Useful Netlify URLs

- Netlify Dashboard: https://app.netlify.com
- Your Site URL: https://your-site-name.netlify.app
- Deploy Logs: Site → Deploys (tab) → Click any deploy
- Function Logs: Site → Functions (tab)

## After Successful Deployment

- [ ] Share site URL with team
- [ ] Update README.md with deployed URLs
- [ ] Set up automatic deployments (should be automatic on master push)
- [ ] Monitor build logs for issues
- [ ] Test all payment integrations (Razorpay/Stripe)

## Backend Integration Verification

1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform an action that calls backend (login, fetch products, etc.)
4. Check API call URL - should be your Render backend URL
5. If not, environment variable isn't set correctly

---

**Deployed Backends:**
- Render (Backend): [Your Render URL here]

**Deployed Frontend:**
- Netlify: https://your-site-name.netlify.app (will be assigned after deployment)

