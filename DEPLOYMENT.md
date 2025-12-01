# CallFlex Deployment Guide

This guide covers deploying CallFlex to Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. Supabase project with deployed schema
3. VAPI account for voice AI
4. Twilio account for phone numbers
5. Stripe account for billing
6. Resend account for emails

## Architecture

```
[Frontend (Next.js)]  ←→  [API (Hono)]  ←→  [Supabase]
     Railway                Railway          Supabase Cloud
                               ↑
                     [VAPI/Twilio/Stripe]
                       External Services
```

## Quick Deploy

### Option 1: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project in the root directory
railway init

# Link services
cd api && railway link
cd ../web && railway link
```

### Option 2: Railway Dashboard

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account and select this repository
4. Railway will auto-detect the monorepo structure

## Environment Variables

### API Service (api/)

Set these in Railway dashboard or via CLI:

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Application URLs
APP_URL=https://your-web.railway.app
API_URL=https://your-api.railway.app

# VAPI
VAPI_API_KEY=xxx
VAPI_WEBHOOK_SECRET=xxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PROFESSIONAL=price_xxx
STRIPE_PRICE_BUSINESS=price_xxx

# Resend
RESEND_API_KEY=re_xxx

# Server
PORT=8787
NODE_ENV=production
```

### Web Service (web/)

```bash
NEXT_PUBLIC_APP_URL=https://your-web.railway.app
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Step-by-Step Deployment

### 1. Deploy API

```bash
cd api
railway up
```

After deployment, note the service URL (e.g., `https://callflex-api.railway.app`)

### 2. Deploy Web

```bash
cd web
railway up
```

After deployment, note the service URL (e.g., `https://callflex-web.railway.app`)

### 3. Configure Webhooks

#### Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api.railway.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the webhook secret and add to Railway env vars

#### VAPI Webhook
1. In VAPI dashboard, set webhook URL per assistant
2. URL format: `https://your-api.railway.app/api/webhooks/vapi/{organizationId}`
3. Configure events: `call-start`, `call-end`, `transcript`, `function-call`

#### Twilio Webhook
1. For each phone number in Twilio
2. Set Voice URL: `https://your-api.railway.app/api/webhooks/twilio/voice`
3. Set Status Callback: `https://your-api.railway.app/api/webhooks/twilio/status`

### 4. Custom Domain (Optional)

1. In Railway dashboard, go to Settings → Domains
2. Add custom domain (e.g., `app.callflex.com` and `api.callflex.com`)
3. Add DNS records as instructed
4. Update environment variables to use custom domains

## Database Migrations

The schema is managed via SQL files. To apply updates:

```bash
# Connect to Supabase and run migrations
psql $DATABASE_URL -f schema_updates.sql
```

## Monitoring

### Railway Logs
```bash
railway logs
```

### Health Check
- API: `https://your-api.railway.app/health`
- Web: Check Next.js status

## Troubleshooting

### API won't start
- Check `PORT` is set to 8787
- Verify all required env vars are set
- Check logs: `railway logs`

### CORS errors
- Verify `APP_URL` is correct in API env
- Check the CORS configuration in `api/src/index.ts`

### Database connection issues
- Verify `DATABASE_URL` is correct
- Check Supabase connection pooling settings
- Ensure IP is not blocked

### Webhook failures
- Verify webhook URLs are correct
- Check webhook secrets match
- Review Railway logs for errors

## Scaling

Railway automatically scales based on demand. For manual scaling:

1. Go to Railway dashboard
2. Select your service
3. Go to Settings → Compute
4. Adjust resources as needed

## Cost Estimation

- Railway: ~$5-20/month (usage-based)
- Supabase Pro: ~$25/month
- VAPI: Usage-based (voice minutes)
- Twilio: Usage-based (phone numbers + minutes)
- Stripe: 2.9% + $0.30 per transaction

Total MVP cost: ~$30-50/month + usage

## Support

For issues, please open a GitHub issue or contact support.
