# 🔍 macOS Voice Override Issue

## Problem Identified

**User hears the SAME FEMALE VOICE for ALL tests**, including:
- Samantha (female)
- "Alex" (male - but doesn't exist on system)
- Terminal `say` commands
- TTS server output

**This indicates macOS is overriding voice selection at the system level.**

---

## Diagnosis Steps

### 1. Check System Voice Settings

**Open System Settings:**
1. System Settings → Accessibility
2. Click "Spoken Content" in the left sidebar
3. Look at "System Voice" dropdown
4. Check if a specific voice is locked/selected

**What to look for:**
- Is a voice hardcoded/locked?
- Is "Speak selection" or "Speak screen" enabled with a specific voice?

### 2. Check VoiceOver Settings

VoiceOver can override all voice settings:

1. System Settings → Accessibility → VoiceOver
2. Check if VoiceOver is ON
3. If ON, check VoiceOver voice settings

### 3. Test Voice Changes Manually

Run this in terminal - **you should hear 3 DIFFERENT voices:**

```bash
say -v Samantha "I am Samantha" && sleep 1
say -v Karen "I am Karen from Australia" && sleep 1  
say -v Zarvox "I am Zarvox, a robot"
```

**If all 3 sound identical → macOS voice override is active**

---

## Potential Causes

### 1. VoiceOver Active
- VoiceOver forces all speech through one voice
- **Fix:** Turn off VoiceOver in Accessibility settings

### 2. Speak Selection Voice Lock
- "Speak selection" might have a locked voice
- **Fix:** System Settings → Accessibility → Spoken Content → Change voice

### 3. Audio Routing Issue
- Audio might be routed through voice processor
- **Fix:** Check Audio MIDI Setup app

### 4. Third-party App Override
- Apps like Voice Control, Siri settings
- **Fix:** Check for voice-related apps in System Settings

---

## Solution Steps

### Option 1: Reset Speech Settings
```bash
# Reset speech preferences
defaults delete com.apple.speech.voice.prefs
defaults delete com.apple.speech.synthesis.general.prefs
killall SystemUIServer
```

### Option 2: Check Accessibility Override
1. System Settings → Accessibility
2. Spoken Content
3. Change "System Voice" to different voices
4. Test if voice actually changes

### Option 3: Use Specific Voice Files
Instead of using voice names, we can use voice IDs:

```python
# In tts_server.py, use voice IDs instead of names
voices_by_id = {
    'en': 'com.apple.voice.premium.en-US.Samantha',  # Try premium
    'karen': 'com.apple.voice.compact.en-AU.Karen',
}
```

---

## Temporary Workaround

Since Alex doesn't exist and all voices sound the same, let's:

1. **Stick with Samantha** (it's available)
2. **Verify it's the best available voice**
3. **Focus on making it work first, worry about changing voices later**

---

## Files to Update

### tts_server.py
Change from Alex to Samantha (or Daniel for male):

```python
voice_map = {
    'en': 'Samantha',  # Use Samantha (confirmed available)
    'zh': 'Tingting',  # Chinese (confirmed available)
    'hi': 'Lekha',     # Hindi
    'ta': 'Vani',      # Tamil (confirmed available)
}
```

---

## Testing

**You should hear the test voices playing now:**
1. Samantha (female, US)
2. Karen (female, Australian accent)
3. Zarvox (robotic, very distinctive)

**If all 3 sound identical**, your Mac has a voice override active.

---

## Next Steps

1. Listen to the 3 test voices playing
2. Tell me if they sound DIFFERENT or all the SAME
3. If same → we need to fix macOS settings
4. If different → we need to fix why code isn't reaching TTS server


