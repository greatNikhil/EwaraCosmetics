# PHASE 9 DEPLOYMENT GUIDE

This guide turns Phase 9 into an executable release checklist.

## 1. Environment Templates

Use these templates as the starting point:

- Frontend: [`.env.production.example`](/C:/Ewara%20codes/.env.production.example)
- Backend: [`backend/.env.production.example`](/C:/Ewara%20codes/backend/.env.production.example)

Rules:

- Only `NEXT_PUBLIC_*` values belong in frontend env files
- Keep backend secrets in backend env files or your hosting provider secret store
- Do not place private secrets in `vercel.json`
- Use live Razorpay keys only in production

## 2. Automated Readiness Audit

From the project root:

```powershell
npm run audit:deploy
npm run type-check
npm run build
cd backend
npm test
npm run test:integrity
```

What the root audit checks:

- no `console.log()` in production source paths
- no `debugger` statements
- frontend `.env.example` contains only public keys
- `.gitignore` protects env files
- `vercel.json` only exposes `NEXT_PUBLIC_*` keys
- backend `.env.example` contains required backend secrets

## 3. Manual Production Checks

Before release, confirm:

1. Hosting env values are populated from secret storage, not committed files.
2. MySQL backups are configured and a restore drill has been documented.
3. Payment flow is tested with live Razorpay keys using a small controlled transaction.
4. Email delivery works with production SMTP credentials.
5. Monitoring and uptime alerts are live before traffic is sent.

## 4. Recommended Release Sequence

1. Run `npm run test:phase9`
2. Run backend verification:
   `cd backend && npm test && npm run test:integrity`
3. Deploy backend
4. Validate backend health endpoint
5. Deploy frontend
6. Run one live checkout smoke test
7. Confirm order, email, stock, and admin visibility
