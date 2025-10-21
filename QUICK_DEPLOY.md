# ⚡ Quick Deploy Guide

Get Senior Safeguard live in 15 minutes!

## 📦 What You Need

- GitHub account (to push your code)
- Railway account (for TTS server) - [railway.app](https://railway.app)
- Vercel account (for web app) - [vercel.com](https://vercel.com)

Both are **FREE** to start!

---

## 🚀 Step 1: Deploy TTS Server (5 mins)

### Option A: Railway (Recommended - Easiest)

1. **Push code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Go to [railway.app](https://railway.app)**
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repo
   - Railway auto-detects `requirements.txt` and `Procfile`

3. **Generate domain**
   - Go to Settings → Generate Domain
   - Copy your URL (e.g., `senior-safeguard.up.railway.app`)

4. **Test it**
   ```bash
   curl https://your-domain.up.railway.app/health
   # Should return: {"status": "healthy"}
   ```

### Option B: No TTS Server (Use Browser Fallback)

Skip this step! The app will use browser TTS automatically if no server is configured.

---

## 🌐 Step 2: Deploy Web App (5 mins)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "/Users/stephenchen/Senior Safeguard"
   vercel
   ```

4. **Set Environment Variable**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project → Settings → Environment Variables
   - Add:
     ```
     Name: NEXT_PUBLIC_TTS_SERVER_URL
     Value: https://your-railway-domain.up.railway.app
     ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## ✅ Step 3: Test (2 mins)

1. **Visit your Vercel URL**
   - Example: `https://senior-safeguard.vercel.app`

2. **Click "Start Voice Assistant"**

3. **Test voice**
   - Click the microphone button
   - Say "Hello, I need help"
   - Verify you hear a response

4. **Test languages**
   - Speak in different languages
   - Verify auto-detection works

---

## 🎉 You're Live!

Your app is now accessible worldwide!

**Share your URL:**
- `https://your-app.vercel.app`
- Works on phones, tablets, computers
- PWA-ready (can be installed as an app)

---

## 💰 Cost Breakdown

**Free Tier (Perfect for demos/testing):**
- Railway: 500 hours/month FREE
- Vercel: 100GB bandwidth/month FREE
- **Total: $0/month** ✅

**If you outgrow free tier:**
- Railway: $5/month
- Vercel: Free tier usually sufficient
- **Total: $5/month**

---

## 🔧 Optional: Add Custom Domain

1. **Buy domain** (Namecheap, GoDaddy, etc.)
2. **In Vercel Dashboard:**
   - Settings → Domains
   - Add your domain
   - Follow DNS instructions
3. **Wait 5-10 minutes for DNS**
4. **Done!** Your app is at `https://yourdomain.com`

---

## ❓ Troubleshooting

### "Failed to fetch" error
- Make sure `NEXT_PUBLIC_TTS_SERVER_URL` is set in Vercel
- Verify Railway service is running
- Check Railway logs for errors

### No voice playback
- Check browser console (F12)
- Verify TTS server URL in console logs
- Try on different browser (Chrome recommended)

### Poor voice quality
- This is expected with gTTS (free service)
- For premium quality: Consider paid TTS APIs
- Or: Use browser TTS (remove TTS server)

---

## 📚 More Details

For detailed instructions, see:
- [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - Complete guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full system deployment

---

## 🆘 Need Help?

1. Check logs: `vercel logs`
2. Check Railway logs: Railway Dashboard → Deployments
3. Open issue on GitHub

---

**That's it! Your AI assistant is live! 🎊**

