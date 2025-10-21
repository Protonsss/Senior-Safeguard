# Environment Variables Setup

This document lists all required environment variables for the Senior Safeguard application.

## Required Services & API Keys

### 1. OpenAI API ⚡ (Required)
**Used for:** AI-powered conversation, task detection, and Q&A features

- `OPENAI_API_KEY` - Your OpenAI API key
- **Get it from:** https://platform.openai.com/api-keys
- **Format:** `sk-proj-...` (starts with sk-proj or sk-)

### 2. Supabase 🗄️ (Required)
**Used for:** Database, authentication, and data storage

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)
- **Get them from:** https://supabase.com/dashboard → Your Project → Settings → API
- **Format:** 
  - URL: `https://xxxxx.supabase.co`
  - Keys: Long JWT tokens starting with `eyJ...`

### 3. Twilio 📞 (Required)
**Used for:** Voice calls (IVR) and SMS messaging

- `TWILIO_ACCOUNT_SID` - Your Twilio account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio auth token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number
- **Get them from:** https://console.twilio.com/
- **Format:**
  - SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - Token: 32 character string
  - Phone: `+1234567890` (E.164 format)

### 4. Redis ⚡ (Required for Background Jobs)
**Used for:** Background job queue (BullMQ)

- `REDIS_URL` - Redis connection URL
- **Development:** Install locally and use `redis://localhost:6379`
- **Production:** Use hosted Redis:
  - [Upstash](https://upstash.com/) (Free tier available)
  - [Redis Cloud](https://redis.com/try-free/)
  - [Railway](https://railway.app/)
- **Format:** `redis://user:password@host:port`

## Optional Environment Variables

- `NODE_ENV` - Set to `production` for production builds (default: `development`)
- `NEXT_PUBLIC_APP_URL` - Your application URL (e.g., `https://yourapp.com`)
- `FORCE_TWILIO_HTTPS` - Set to `true` if behind a proxy forcing HTTP (default: `false`)

## Setup Instructions

1. Create a `.env.local` file in the root directory
2. Copy the template below and fill in your actual values
3. **Never commit `.env.local` to git** (it's already in `.gitignore`)

### .env.local Template

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-token-here
TWILIO_PHONE_NUMBER=+1234567890

# Redis
REDIS_URL=redis://localhost:6379

# App Config
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Quick Start for Development

### 1. Install Redis locally (macOS):
```bash
brew install redis
brew services start redis
```

### 2. Set up Supabase:
- Run the SQL schema: `supabase/schema.sql`
- Run the seed data: `supabase/seed.sql`

### 3. Configure Twilio webhooks:
- Voice webhook: `https://your-domain.com/api/ivr/voice`
- SMS webhook: `https://your-domain.com/api/sms/incoming`
- Use [ngrok](https://ngrok.com/) for local development

### 4. Test the build:
```bash
npm run build
```

## Cost Estimates

- **OpenAI:** Pay-per-use (~$0.01-0.03 per conversation)
- **Supabase:** Free tier available (500MB database)
- **Twilio:** ~$1/month per phone number + usage
- **Redis:** Free tier available (Upstash: 10k requests/day)

## Security Notes

⚠️ **IMPORTANT:**
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin access
- Never expose API keys in client-side code
- Use environment variables, never hardcode keys
- Rotate keys if accidentally exposed


