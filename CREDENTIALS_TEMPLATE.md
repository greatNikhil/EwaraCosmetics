# Credentials Template

Use this as your personal one-place reference.
Do not commit real secrets into this file.
Put your actual values in `CREDENTIALS.local.md`, which is gitignored.

## Database

- Connection name:
- Host:
- Port:
- Database name:
- Username:
- Password:
- Source file:
  - `backend/.env`

## Backend App

- Port:
- Node environment:
- JWT secret:
- Frontend URL:
- CORS origins:
- Source file:
  - `backend/.env`

## Frontend App

- Public API URL:
- Public app URL:
- Google client ID:
- Source files:
  - `.env.local`
  - `.env.example`

## Razorpay

- Public key ID:
- Secret key:
- Environment:
  - `test` or `live`
- Source files:
  - `.env.local`
  - `backend/.env`

## Email Service

- Email user:
- Email password or app password:
- From address:
- Support email:
- Source file:
  - `backend/.env`

## Other Services

- Service name:
- Username or account email:
- Password or token:
- Notes:

## Quick Access Files

- Root frontend env: `.env.local`
- Backend env: `backend/.env`
- Frontend sample env: `.env.example`
- Backend sample env: `backend/.env.example`
- DB config: `backend/src/config/db.ts`
- Email utility: `backend/src/utils/sendEmail.ts`
- Razorpay route: `app/api/checkout/razorpay/route.ts`
