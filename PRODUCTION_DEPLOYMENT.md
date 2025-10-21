# 🚀 Production Deployment Guide - Senior Safeguard

Complete guide to deploy your Senior Safeguard AI assistant to production.

## 📋 Overview

We'll deploy two components:
1. **Next.js Frontend** → Vercel (recommended)
2. **Python TTS Server** → Railway (or Render, Fly.io)

---

## Part 1: Deploy Python TTS Server to Railway

### Step 1.1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

### Step 1.2: Deploy TTS Server

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account
4. Select your **Senior Safeguard** repository
5. Click **"Deploy Now"**

### Step 1.3: Configure Environment

1. Go to your project → **Variables** tab
2. Add: `PORT=8765` (Railway will override this, but good to have)
3. Railway will automatically detect `requirements.txt` and `Procfile`

### Step 1.4: Get Your TTS Server URL

1. Go to **Settings** tab
2. Click **"Generate Domain"**
3. Copy your domain (e.g., `senior-safeguard-production.up.railway.app`)
4. Your TTS server will be at: `https://your-domain.up.railway.app`

**Test it:**
```bash
curl https://your-domain.up.railway.app/health
# Should return: {"status": "healthy", "gtts_available": true}
```

---

## Part 2: Deploy Next.js Frontend to Vercel

### Step 2.1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2.2: Login to Vercel

```bash
vercel login
```

### Step 2.3: Link Project

```bash
cd "/Users/stephenchen/Senior Safeguard"
vercel link
```

### Step 2.4: Set Environment Variables

Either via CLI or Vercel Dashboard:

**Via Dashboard (Recommended):**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```bash
# TTS Server (from Railway)
NEXT_PUBLIC_TTS_SERVER_URL=https://your-railway-domain.up.railway.app

# OpenAI (optional - for enhanced AI features)
OPENAI_API_KEY=sk-proj-your-key-here

# Supabase (optional - for database features)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...

# Twilio (optional - for phone call features)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-token-here
TWILIO_PHONE_NUMBER=+1234567890

# Redis (optional - for background jobs)
REDIS_URL=redis://default:password@host:port
```

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_TTS_SERVER_URL
# Paste your Railway URL when prompted
```

### Step 2.5: Deploy to Production

```bash
vercel --prod
```

This will:
- Build your Next.js app
- Optimize assets
- Deploy to Vercel's CDN
- Give you a production URL

---

## Part 3: Test Your Deployment

### 3.1: Test TTS Server

```bash
curl -X POST https://your-railway-domain.up.railway.app/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test","language":"en"}' \
  --output test.mp3

# Then play test.mp3 to verify
```

### 3.2: Test Frontend

1. Visit your Vercel URL (e.g., `https://senior-safeguard.vercel.app`)
2. Click "Start Voice Assistant"
3. Test voice recording and TTS playback
4. Try different languages

### 3.3: Test Auto-Language Detection

1. Speak in English: "Hello, I need help"
2. Speak in Chinese: "你好，我需要帮助"
3. Verify it responds in the correct language

---

## 🎯 Alternative Deployment Options

### Option 1: Deploy TTS to Render.com

1. Go to [render.com](https://render.com)
2. Create **New Web Service**
3. Connect your GitHub repo
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python tts_server_cloud.py`
6. Add environment variable: `PYTHON_VERSION=3.11`

### Option 2: Deploy TTS to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Create fly.toml
fly launch

# Deploy
fly deploy
```

### Option 3: Use Vercel for Everything (No TTS Server)

If you don't want to deploy the TTS server separately:

1. Remove `NEXT_PUBLIC_TTS_SERVER_URL` from environment variables
2. The app will automatically fall back to browser TTS
3. Trade-off: Browser TTS is lower quality but requires no server

---

## 📊 Monitoring & Maintenance

### Railway Monitoring

1. View logs: Railway Dashboard → Deployments → Logs
2. Monitor usage: Dashboard → Metrics
3. Free tier: 500 hours/month (plenty for TTS server)

### Vercel Monitoring

1. View logs: `vercel logs`
2. Analytics: Vercel Dashboard → Analytics
3. Performance: Dashboard → Speed Insights

### Health Checks

Set up monitoring with [UptimeRobot](https://uptimerobot.com/) or similar:
- Check: `https://your-app.vercel.app`
- Check: `https://your-railway-app.up.railway.app/health`

---

## 💰 Cost Estimates

**Free Tier (Good for testing & small scale):**
- Railway: Free tier (500 hours/month)
- Vercel: Free tier (100GB bandwidth/month)
- gTTS: Free (Google's service)
- **Total: $0/month**

**Paid Tier (For production):**
- Railway: $5/month (Starter)
- Vercel: $20/month (Pro) - optional
- **Total: $5-25/month**

**Optional Services:**
- OpenAI API: Pay-per-use (~$10-100/month depending on usage)
- Supabase: $25/month (Pro)
- Twilio: $1/month + usage
- Redis: $10/month (Upstash)

---

## 🔒 Security Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] No API keys in source code
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] CORS configured properly
- [ ] Rate limiting enabled (Vercel Edge Middleware)
- [ ] Error tracking set up (Sentry, optional)

---

## 🐛 Troubleshooting

### Issue: TTS not working in production

**Solution:**
1. Check `NEXT_PUBLIC_TTS_SERVER_URL` is set correctly
2. Verify Railway service is running: `curl https://your-domain/health`
3. Check browser console for CORS errors
4. Ensure Railway domain has HTTPS

### Issue: "Failed to fetch" error

**Solution:**
1. Verify TTS server URL doesn't have trailing slash
2. Check Railway logs for errors
3. Test TTS endpoint directly with curl
4. Verify CORS headers are present

### Issue: Voice quality is poor

**Solution:**
- gTTS provides decent quality but not premium
- For better quality, consider:
  - ElevenLabs API (paid)
  - Google Cloud TTS (paid)
  - Azure TTS (paid)
  - Keep using local macOS voices for development

### Issue: Vercel build fails

**Solution:**
1. Check build logs: `vercel logs`
2. Verify `package.json` has correct dependencies
3. Make sure environment variables are set
4. Try building locally first: `npm run build`

---

## 🎉 Next Steps After Deployment

1. **Custom Domain (Optional)**
   - Buy domain on Namecheap/GoDaddy
   - Add to Vercel: Settings → Domains
   - Configure DNS: Add CNAME to Vercel

2. **Analytics**
   - Enable Vercel Analytics
   - Set up Google Analytics (optional)

3. **User Testing**
   - Share link with beta users
   - Collect feedback
   - Monitor error logs

4. **Documentation**
   - Update README with production URL
   - Document any issues encountered
   - Create user guide

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **gTTS Docs:** https://gtts.readthedocs.io

---

## ✅ Deployment Checklist

**Pre-Deployment:**
- [ ] Code pushed to GitHub
- [ ] Environment variables documented
- [ ] Build succeeds locally (`npm run build`)
- [ ] TTS server tested locally

**Railway Deployment:**
- [ ] Railway account created
- [ ] TTS server deployed
- [ ] Domain generated
- [ ] Health check passes

**Vercel Deployment:**
- [ ] Vercel account created
- [ ] Environment variables set
- [ ] `NEXT_PUBLIC_TTS_SERVER_URL` points to Railway
- [ ] Production deployment successful

**Post-Deployment:**
- [ ] Test all features on production URL
- [ ] Test on mobile devices
- [ ] Test multiple languages
- [ ] Set up monitoring
- [ ] Share with users

---

**Your app is now live! 🎉**

Visit: `https://your-app.vercel.app`

Need help? Check the troubleshooting section or open an issue on GitHub.

