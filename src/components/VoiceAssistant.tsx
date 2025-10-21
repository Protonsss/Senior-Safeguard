'use client';

import { useState, useEffect, useRef } from 'react';
import { Language, t } from '@/lib/i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceAssistantProps {
  language: Language;
}

export default function VoiceAssistant({ language }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speakingTimerRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const shouldKeepListeningRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening while held
      recognitionRef.current.interimResults = true;

      // Set language
      const langCodes: Record<Language, string> = {
        en: 'en-US',
        zh: 'zh-CN',
        hi: 'hi-IN',
        ta: 'ta-IN',
      };
      recognitionRef.current.lang = langCodes[language];

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        console.log('Transcript:', transcript);
        setCurrentTranscript(transcript);
        
        // Just display the transcript - DON'T auto-process
        // User must manually click stop button to process
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        // Only stop on actual critical errors
        // Don't stop on: no-speech (user hasn't spoken), audio-capture (temporary issue), network (might recover)
        const nonCriticalErrors = ['no-speech', 'audio-capture', 'network'];
        if (!nonCriticalErrors.includes(event.error)) {
          console.log('Critical error, stopping recognition');
          shouldKeepListeningRef.current = false;
          setIsListening(false);
        } else {
          console.log('Non-critical error, continuing...');
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        // With continuous: true, recognition shouldn't end unless error
        // Only reset if user asked to stop
        if (!shouldKeepListeningRef.current) {
          setIsListening(false);
        }
      };
    }

    // Load available speech voices (some browsers load async)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (Array.isArray(v) && v.length) {
          voicesRef.current = v;
        }
      };
      loadVoices();
      if (typeof window !== 'undefined') {
        (window.speechSynthesis as any).onvoiceschanged = loadVoices;
      }
    }

    // Initial greeting
    const greeting = t(language, 'greeting.welcome');
    addMessage('assistant', greeting);
    speak(greeting);

    return () => {
      // Clean up on unmount or language change
      shouldKeepListeningRef.current = false;
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setCurrentTranscript('');
      shouldKeepListeningRef.current = true; // Track that we're actively listening
      
      try {
        console.log('Starting recognition...');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.error('Error starting recognition:', err);
        shouldKeepListeningRef.current = false;
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log('User stopping - transcript:', currentTranscript);
      shouldKeepListeningRef.current = false; // Signal to stop
      
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
      
      setIsListening(false);
      
      // Process the transcript when user stops
      if (currentTranscript.trim()) {
        handleUserInput(currentTranscript);
      }
      setCurrentTranscript('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speak = async (text: string) => {
    if (typeof window === 'undefined') return;

    // Use cloud TTS server or fallback to local
    const ttsServerUrl = process.env.NEXT_PUBLIC_TTS_SERVER_URL || 'http://127.0.0.1:8765';
    
    console.log('[TTS] ========================================');
    console.log('[TTS] SPEAK FUNCTION CALLED');
    console.log('[TTS] Text:', text.substring(0, 100));
    console.log('[TTS] Language:', language);
    console.log('[TTS] Server:', ttsServerUrl);
    console.log('[TTS] ========================================');
    
    try {
      console.log(`[TTS] 1️⃣ Attempting to connect to TTS server at ${ttsServerUrl}/tts`);
      
      // Stop any ongoing audio
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current.src = '';
        audioRef.current = null;
      }
      
      // Cancel any browser TTS
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      setIsSpeaking(true);
      
      console.log('[TTS] 2️⃣ Sending POST request...');
      const resp = await fetch(`${ttsServerUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      
      console.log('[TTS] 3️⃣ Got response:', resp.status, resp.statusText);
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('[TTS] Server returned error:', resp.status, errorText);
        throw new Error(`TTS server error: ${resp.status} - ${errorText}`);
      }
      
      console.log('[TTS] 4️⃣ Creating audio blob...');
      const blob = await resp.blob();
      console.log('[TTS] Blob size:', blob.size, 'bytes, type:', blob.type);
      
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => { 
        console.log('[TTS] ✅ Audio playback finished');
        setIsSpeaking(false); 
        URL.revokeObjectURL(url); 
      };
      audio.onerror = (err) => { 
        console.error('[TTS] ❌ Audio playback error:', err);
        setIsSpeaking(false); 
        URL.revokeObjectURL(url); 
      };
      
      console.log('[TTS] 5️⃣ Starting audio playback...');
      await audio.play();
      console.log('[TTS] ✅✅✅ TTS SERVER AUDIO IS PLAYING (ALEX MALE VOICE) ✅✅✅');
      console.log('[TTS] If you hear a MALE voice, the TTS server is working!');
      console.log('[TTS] If you hear a FEMALE voice, you are hearing browser fallback!');
      return;
    } catch (err: any) {
      console.error('[TTS] ❌❌❌ FAILED TO USE TTS SERVER ❌❌❌');
      console.error('[TTS] Error details:', err);
      console.error('[TTS] Error message:', err?.message);
      console.error('[TTS] Error stack:', err?.stack);
      console.log('[TTS] ⚠️ FALLING BACK TO BROWSER TTS (WILL SOUND ROBOTIC)');
      setIsSpeaking(false);
      // Fallback to browser TTS if server fails
    }

    // Fallback: browser TTS (only if local server fails)
    if (window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
      setIsSpeaking(false);

      const chunks = chunkTextForSeniors(text);
      setIsSpeaking(true);

      const speakNext = () => {
        const next = chunks.shift();
        if (!next) {
          setIsSpeaking(false);
          return;
        }
        const utterance = new SpeechSynthesisUtterance(next);

        // Choose friendly, human-like voice by name + locale
        const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
        const pickFriendlyVoice = (): SpeechSynthesisVoice | undefined => {
          const byName: Record<Language, string[]> = {
            en: ['Samantha', 'Serena', 'Victoria', 'Ava', 'Allison', 'Alex', 'Google US English', 'Google UK English Female'],
            zh: ['Ting-Ting', 'Mei-Jia', 'Google 普通话（中国大陆）', 'Google 中文（普通话）'],
            hi: ['Google हिन्दी', 'Lekha'],
            ta: ['Google தமிழ்'],
          };
          const names = byName[language] || [];
          const localFirst = voices.filter(v => (v as any).localService === true);
          const nameMatch = [...localFirst, ...voices].find(v => names.includes(v.name));
          if (nameMatch) return nameMatch;
          const prefixes: Record<Language, string[]> = {
            en: ['en-US', 'en-GB', 'en'],
            zh: ['zh-CN', 'zh-TW', 'zh'],
            hi: ['hi-IN', 'hi'],
            ta: ['ta-IN', 'ta'],
          };
          const pref = prefixes[language];
          return [...localFirst, ...voices].find(v => pref.some(p => v.lang?.startsWith(p)));
        };
        const chosen = pickFriendlyVoice();
        if (chosen) utterance.voice = chosen;

        // Senior-friendly voice settings per chunk (slight pitch variation avoids monotone)
        utterance.rate = 0.92;
        utterance.pitch = 1.0 + (Math.random() * 0.06 - 0.03);
        utterance.volume = 1.0;

        utterance.onstart = () => {
          // Fallback: if onend doesn't fire (Safari bug), end after estimated duration
          if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
          const estMs = Math.min(20000, Math.max(1500, estimateDurationMs(next)));
          speakingTimerRef.current = window.setTimeout(() => {
            setIsSpeaking(false);
          }, estMs + 300);
        };
        utterance.onerror = () => {
          if (speakingTimerRef.current) {
            clearTimeout(speakingTimerRef.current);
            speakingTimerRef.current = null;
          }
          setIsSpeaking(false);
        };
        utterance.onend = () => {
          if (speakingTimerRef.current) {
            clearTimeout(speakingTimerRef.current);
            speakingTimerRef.current = null;
          }
          setTimeout(speakNext, 120); // gentle pause between sentences
        };
        synthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      speakNext();
    }
  };

  function chunkTextForSeniors(text: string): string[] {
    // Split on sentence boundaries and trim; keep sentences short for natural prosody
    const parts = text
      .split(/(?<=[\.\!\?])\s+|\n+/)
      .map(s => s.trim())
      .filter(Boolean);
    // If everything is one long line, hard-wrap into ~14 word chunks
    if (parts.length <= 1 && text.length > 140) {
      const words = text.split(/\s+/);
      const chunks: string[] = [];
      let buf: string[] = [];
      for (const w of words) {
        buf.push(w);
        if (buf.length >= 14) { chunks.push(buf.join(' ')); buf = []; }
      }
      if (buf.length) chunks.push(buf.join(' '));
      return chunks;
    }
    return parts;
  }

  function estimateDurationMs(text: string): number {
    const words = text.split(/\s+/).filter(Boolean).length;
    // ~160 wpm -> ~375ms per word; add buffer
    return Math.round(words * 375);
  }

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const handleUserInput = async (transcript: string) => {
    if (!transcript.trim()) return;

    addMessage('user', transcript);
    setCurrentTranscript('');

    try {
      // Auto-detect language from text (don't force the UI language)
      // This allows users to speak any language and get responses in that language
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          // Don't send language - let API auto-detect!
          // language,  // REMOVED - enables auto-detection
          history: messages.slice(-5),
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        const serverMsg = data?.message ? String(data.message) : t(language, 'errors.technical');
        const debug = data?.debug ? `\nDetails: ${String(data.debug)}` : '';
        const out = `${serverMsg}${debug}`.trim();
        addMessage('assistant', out);
        speak(serverMsg); // speak only the friendly part
        return;
      }

      if (data.message) {
        addMessage('assistant', data.message);
        speak(data.message);
      }
    } catch (error) {
      console.error('Error processing input:', error);
      const errorMsg = t(language, 'errors.technical');
      addMessage('assistant', errorMsg);
      speak(errorMsg);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 md:pb-0">
      {/* Conversation Display with glassmorphism */}
      <div className="card-senior min-h-[350px] sm:min-h-[450px] max-h-[450px] sm:max-h-[650px] overflow-y-auto custom-scrollbar">
        <div className="space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-600 text-senior-lg py-8 sm:py-12 flex flex-col items-center">
              <div className="text-6xl mb-4 animate-bounce">💬</div>
              <p className="font-semibold">{t(language, 'common.slow_down')}</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-4 sm:p-6 rounded-2xl shadow-lg backdrop-blur-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    : 'bg-white/90 text-gray-900 border border-white/20'
                }`}
              >
                <p className="text-senior-message text-sm sm:text-base leading-relaxed">{msg.content}</p>
                <span className="text-xs sm:text-sm opacity-70 mt-2 block">
                  {msg.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}

          {currentTranscript && (
            <div className="flex justify-end animate-fadeIn">
              <div className="max-w-[85%] sm:max-w-[80%] p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 bg-opacity-60 backdrop-blur-sm text-white shadow-lg">
                <p className="text-senior-message text-sm sm:text-base italic flex items-center gap-2">
                  <span className="animate-pulse">🎙️</span>
                  {currentTranscript}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Button with enhanced design */}
      <div className="flex flex-col items-center space-y-4 sm:space-y-6">
        <button
          onClick={toggleListening}
          className={`btn-voice transition-all duration-300 ${isListening ? 'active ring-4 ring-pink-400 ring-opacity-50' : ''} ${
            isSpeaking ? 'opacity-60 cursor-not-allowed grayscale' : ''
          }`}
          disabled={isSpeaking}
          title={isListening ? "Click to stop recording" : "Click to start recording"}
        >
          {isListening ? (
            <span className="text-5xl sm:text-6xl animate-pulse">🎤</span>
          ) : isSpeaking ? (
            <span className="text-5xl sm:text-6xl">💭</span>
          ) : (
            <span className="text-5xl sm:text-6xl">🗣️</span>
          )}
        </button>

        <div className="text-center glass-card px-6 py-3">
          <p className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
            {isListening ? '🔴 Listening...' : 
             isSpeaking ? '🔊 Speaking...' :
             '✨ Ready to Chat'}
          </p>
          {!isListening && !isSpeaking && (
            <p className="text-white/90 mt-2 text-sm sm:text-base">
              {t(language, 'common.help')}
            </p>
          )}
        </div>
      </div>

      {/* Quick Action Suggestions with gradient buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => handleUserInput('I need help with Zoom')}
          className="glass-card hover:scale-105 transition-all text-xs sm:text-sm py-3 sm:py-4 text-left text-white font-medium hover:bg-white/20"
          disabled={isListening || isSpeaking}
          title="Try asking about video calls"
        >
          <span className="text-2xl block mb-1">🎥</span>
          Zoom help
        </button>
        <button
          onClick={() => handleUserInput('I want to call someone')}
          className="glass-card hover:scale-105 transition-all text-xs sm:text-sm py-3 sm:py-4 text-left text-white font-medium hover:bg-white/20"
          disabled={isListening || isSpeaking}
          title="Try asking to make a call"
        >
          <span className="text-2xl block mb-1">📞</span>
          Call family
        </button>
        <button
          onClick={() => handleUserInput('Volume is too low')}
          className="glass-card hover:scale-105 transition-all text-xs sm:text-sm py-3 sm:py-4 text-left text-white font-medium hover:bg-white/20"
          disabled={isListening || isSpeaking}
          title="Try asking about volume"
        >
          <span className="text-2xl block mb-1">🔊</span>
          Volume help
        </button>
        <button
          onClick={() => handleUserInput('I got a suspicious call')}
          className="glass-card hover:scale-105 transition-all text-xs sm:text-sm py-3 sm:py-4 text-left text-white font-medium hover:bg-white/20"
          disabled={isListening || isSpeaking}
          title="Try asking about scam check"
        >
          <span className="text-2xl block mb-1">🛡️</span>
          Check scam
        </button>
      </div>
    </div>
  );
}

