#!/bin/bash
# Voice Quality Test Script
# Compare old (pyttsx3) vs new (native say) voice quality

echo "🎤 Voice Quality Test"
echo "===================="
echo ""

echo "Testing TTS Server..."
if lsof -i :8765 >/dev/null 2>&1; then
    echo "✅ TTS Server is running on port 8765"
else
    echo "❌ TTS Server is NOT running"
    echo "   Start it with: ./start-with-tts.sh"
    exit 1
fi

echo ""
echo "📝 Test 1: Direct macOS 'say' command (what the TTS server uses now)"
echo "This should sound natural and human-like..."
sleep 1
say -v Samantha -r 160 "Hello! I am Samantha. This is the high quality voice from macOS. I should sound natural and human, not robotic."

echo ""
echo "Waiting 2 seconds..."
sleep 2

echo ""
echo "📝 Test 2: TTS Server (via HTTP)"
echo "This should sound the same as Test 1..."
sleep 1
curl -X POST http://127.0.0.1:8765/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a test from the TTS server. I am using the native macOS say command. My voice should be clear, natural, and human-like.","language":"en"}' \
  --output /tmp/tts-server-test.wav --silent --show-error

if [ -f /tmp/tts-server-test.wav ]; then
    SIZE=$(ls -lh /tmp/tts-server-test.wav | awk '{print $5}')
    echo "✅ Audio file created: $SIZE"
    afplay /tmp/tts-server-test.wav
else
    echo "❌ Failed to create audio file"
    echo "Check TTS server logs: cat tts_server.log"
fi

echo ""
echo "===================="
echo "🎯 Voice Quality Check:"
echo ""
echo "Did the voice sound natural and human-like?"
echo "  YES → Everything is working correctly! ✅"
echo "  NO  → See troubleshooting in TTS_FIX_APPLIED.md"
echo ""
echo "Next: Open http://localhost:3000/senior and test the web interface!"

