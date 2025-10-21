# 🚀 Quick Start Guide - Senior Safeguard

## Start Everything (One Command)

```bash
cd "/Users/stephenchen/Senior Safeguard"
./start-with-tts.sh
```

This starts:
1. **TTS Server** (port 8765) - High-quality voice
2. **Next.js Server** (port 3000) - Web application

---

## Test Voice Quality

```bash
./test-voice-quality.sh
```

**What to listen for:**
- ✅ Natural, human-like voice
- ✅ Clear pronunciation
- ✅ Comfortable pace (not too fast)
- ❌ NOT robotic or mechanical

---

## Open the Application

**Senior Interface (for elderly users):**
http://localhost:3000/senior

**Caregiver Dashboard:**
http://localhost:3000/caregiver

---

## Quick Voice Test

Try these with the microphone:
1. Click the microphone button 🎤
2. Say: **"What time is it?"**
3. Listen to Samantha respond
4. Say: **"Tell me about Sync.me"**
5. Say: **"I need help with Zoom"**

---

## Status Check

```bash
# Check if both servers are running
ps aux | grep -E "(tts_server|next)" | grep -v grep

# Check TTS server specifically
lsof -i :8765

# Check Next.js server specifically
lsof -i :3000
```

---

## Restart if Needed

```bash
# Stop everything
lsof -ti :8765 | xargs kill -9
pkill -f "next dev"

# Start again
./start-with-tts.sh
```

---

## Files & Documentation

- **VOICE_SYSTEM_README.md** - Complete voice system guide
- **TTS_FIX_APPLIED.md** - Details on voice quality fix
- **SYSTEM_STATUS.md** - Full system status
- **test-voice-quality.sh** - Voice quality test script
- **ENVIRONMENT_VARIABLES.md** - Configuration guide

---

## Common Issues

### Voice sounds robotic?
✅ **FIXED!** The system now uses native macOS voices.

Run the test: `./test-voice-quality.sh`

If still robotic, see `TTS_FIX_APPLIED.md` troubleshooting section.

### Server not starting?
```bash
# Check what's using the port
lsof -i :8765

# Kill it
lsof -ti :8765 | xargs kill -9

# Restart
./start-with-tts.sh
```

### Web page won't load?
```bash
# Check Next.js is running
lsof -i :3000

# Check browser console for errors
# Open DevTools: Cmd+Option+I
```

---

## System Requirements

- ✅ macOS (for native voice system)
- ✅ Python 3.13+
- ✅ Node.js 18+
- ✅ Internet connection (for OpenAI API)

---

## Environment Variables

Make sure `.env.local` has:
- `OPENAI_API_KEY` - For AI conversations
- `NEXT_PUBLIC_SUPABASE_URL` - For database
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For database
- `SUPABASE_SERVICE_ROLE_KEY` - For database

See `ENVIRONMENT_VARIABLES.md` for full list.

---

## What's Working

✅ High-quality voice output (Samantha)  
✅ Voice input (Web Speech API)  
✅ AI conversations (GPT-4)  
✅ Task guidance (Zoom, Phone, Volume, WiFi)  
✅ Scam protection (Sync.me)  
✅ Multilingual support (English, Hindi)  

---

## Next Steps

1. ✅ Run `./start-with-tts.sh`
2. ✅ Run `./test-voice-quality.sh`
3. ✅ Open http://localhost:3000/senior
4. ✅ Test the voice interface
5. ✅ Try different tasks

**Enjoy your human-like AI voice assistant!** 🎉

