#!/bin/bash
# Start both the TTS server and Next.js dev server

# Kill any existing TTS server
lsof -ti :8765 | xargs kill -9 2>/dev/null || true

# Kill any existing Next.js dev server
pkill -f "next dev" || true

echo "🚀 Starting Senior Safeguard with high-quality TTS..."

# Start TTS server in background
cd "$(dirname "$0")"
python3 tts_server.py > tts_server.log 2>&1 &
TTS_PID=$!
echo $TTS_PID > tts_server.pid
echo "✅ TTS Server started (PID: $TTS_PID) on port 8765"

sleep 2

# Start Next.js dev server
npm run dev

