# Senior Safeguard - Deployment Guide

Complete guide for deploying the Senior Safeguard multilingual voice AI assistant.

## Prerequisites

### Required Accounts
- [x] Vercel account (for Next.js deployment)
- [x] Supabase account (for database)
- [x] Twilio account (for IVR and SMS)
- [x] OpenAI account (for AI features)
- [x] Google Cloud account (for TTS/STT)
- [x] Redis instance (for BullMQ workers)
- [x] Sync.me partnership (for scam detection)

### Required Tools
- Node.js 18+
- PostgreSQL (via Supabase)
- Redis server
- ngrok (for local testing)

## Step 1: Environment Setup

### 1.1 Clone and Install

```bash
git clone <repository-url>
cd "Senior Safeguard"
npm install
```

### 1.2 Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+14155550000
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Redis
REDIS_URL=redis://localhost:6379

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Sync.me
SYNCME_API_KEY=your_syncme_key
SYNCME_PARTNER_ID=your_partner_id

# Security
JWT_SECRET=your_jwt_secret_minimum_32_characters
WEBHOOK_SECRET=your_webhook_secret
```

## Step 2: Database Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy project URL and keys

### 2.2 Run Database Schema

```bash
# In Supabase SQL Editor, run:
cat supabase/schema.sql | pbcopy
# Paste into SQL Editor and execute
```

### 2.3 Run Seed Data (Optional)

```bash
# For development/testing
cat supabase/seed.sql | pbcopy
# Paste into SQL Editor and execute
```

## Step 3: Twilio Configuration

### 3.1 Get Twilio Phone Number

1. Log in to Twilio Console
2. Buy a phone number (supports Voice + SMS)
3. Note the phone number

### 3.2 Configure Webhooks

**Voice Webhook:**
```
URL: https://your-domain.com/api/ivr/voice
Method: POST
```

**SMS Webhook:**
```
URL: https://your-domain.com/api/sms/incoming
Method: POST
```

### 3.3 Test with ngrok (Local Development)

```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Use ngrok URL in Twilio webhooks
https://abc123.ngrok.io/api/ivr/voice
```

## Step 4: Google Cloud Setup

### 4.1 Enable APIs

1. Go to Google Cloud Console
2. Enable:
   - Cloud Text-to-Speech API
   - Cloud Speech-to-Text API

### 4.2 Create Service Account

1. Create service account
2. Grant roles:
   - Cloud Text-to-Speech Client
   - Cloud Speech-to-Text Client
3. Download JSON key
4. Save as `google-credentials.json` (excluded from git)

## Step 5: OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to environment variables
4. Set usage limits if desired

## Step 6: Redis Setup

### Development (Local)

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
```

### Production (Options)

**Option A: Upstash (Serverless Redis)**
1. Go to [upstash.com](https://upstash.com)
2. Create database
3. Copy Redis URL

**Option B: Redis Cloud**
1. Go to [redis.com/cloud](https://redis.com/cloud)
2. Create database
3. Copy connection string

## Step 7: Deploy Application

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Go to Settings → Environment Variables
# Add all variables from .env

# Deploy to production
vercel --prod
```

### Option B: Docker

```bash
# Build image
docker build -t senior-safeguard .

# Run container
docker run -p 3000:3000 --env-file .env senior-safeguard
```

### Option C: Traditional Server

```bash
# Build application
npm run build

# Start production server
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "senior-safeguard" -- start
pm2 save
pm2 startup
```

## Step 8: Background Workers

### Deploy Workers

```bash
# On your server or separate worker instance
npm run worker

# With PM2
pm2 start npm --name "ss-workers" -- run worker
pm2 save
```

### Configure Cron Jobs

Add to crontab for daily metrics:

```bash
# Edit crontab
crontab -e

# Add daily metrics job (runs at 1 AM)
0 1 * * * curl -X POST https://your-domain.com/api/cron/daily-metrics
```

## Step 9: Sync.me Integration

### 9.1 Partnership Setup

1. Contact Sync.me for partnership
2. Get API credentials
3. Add to environment variables

### 9.2 Configure Scam Detection

The system is pre-configured with Sync.me integration in:
- `src/lib/scam/syncme.ts`

For production, replace mock functions with actual API calls.

## Step 10: Testing

### 10.1 Test IVR

1. Call Twilio number
2. Follow voice prompts
3. Try different languages
4. Test guided tasks

### 10.2 Test Web PWA

1. Visit https://your-domain.com/senior
2. Select language
3. Test voice interface
4. Test quick actions

### 10.3 Test SMS

Send SMS to Twilio number:
```
HELP
CHECK 18005551111
STATUS
```

### 10.4 Test Caregiver Portal

1. Visit https://your-domain.com/caregiver
2. Check metrics dashboard
3. Review scam alerts
4. Check activity logs

## Step 11: Monitoring & Maintenance

### 11.1 Set Up Monitoring

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
# Follow Sentry Next.js setup
```

**Vercel Analytics:**
- Enable in Vercel dashboard
- Monitor performance and errors

### 11.2 Database Backups

Supabase includes automatic backups, but also:
1. Enable Point-in-Time Recovery (PITR)
2. Schedule manual backups weekly

### 11.3 Logs

**Vercel Logs:**
```bash
vercel logs
```

**Worker Logs:**
```bash
pm2 logs ss-workers
```

### 11.4 Health Checks

Create monitoring for:
- `/api/health` endpoint
- Twilio webhook uptime
- Worker queue status
- Database connections

## Step 12: Scaling Considerations

### 12.1 Horizontal Scaling

- **Web servers:** Scale with Vercel auto-scaling
- **Workers:** Deploy multiple worker instances
- **Redis:** Use Redis Cluster for high traffic

### 12.2 Rate Limiting

Add rate limiting for:
- API endpoints (use Vercel Edge Middleware)
- OpenAI calls (queue system)
- Twilio webhooks (validate signatures)

### 12.3 Caching

Implement caching for:
- TTS audio (CDN)
- Common responses (Redis)
- Language translations (static)

## Troubleshooting

### Issue: Twilio webhooks not receiving

1. Check webhook URL is correct
2. Verify SSL certificate (must be HTTPS)
3. Check Twilio webhook logs
4. Test with ngrok locally

### Issue: Voice not working on web

1. Check browser permissions
2. Verify HTTPS (required for Web Speech API)
3. Test in Chrome/Edge (best support)

### Issue: Workers not processing jobs

1. Check Redis connection
2. Verify `npm run worker` is running
3. Check worker logs
4. Restart workers

### Issue: Language detection failing

1. Verify OpenAI API key
2. Check language in i18n files
3. Test with explicit menu selection

## Security Checklist

- [x] All environment variables secured
- [x] Supabase Row Level Security enabled
- [x] Twilio webhook signatures validated
- [x] HTTPS enforced
- [x] Rate limiting configured
- [x] API keys rotated regularly
- [x] Logs sanitized (no PII)
- [x] CORS configured properly

## Cost Estimates (Monthly)

**Small Scale (100 seniors):**
- Vercel: $20 (Pro plan)
- Supabase: $25 (Pro plan)
- Twilio: ~$50 (calls + SMS)
- OpenAI: ~$100 (GPT-4 usage)
- Redis: $10 (Upstash)
- Total: ~$205/month

**Medium Scale (1000 seniors):**
- Vercel: $20
- Supabase: $100 (with addons)
- Twilio: ~$500
- OpenAI: ~$1000
- Redis: $50
- Total: ~$1670/month

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## Post-Deployment

1. Monitor first 24 hours closely
2. Gather user feedback
3. Adjust language/pacing as needed
4. Train caregivers on portal
5. Document any issues encountered
6. Update this guide with learnings

---

**Deployment completed!** 🎉

Your Senior Safeguard system is now live and ready to help seniors worldwide.

