'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, HelpCircle, Eye, EyeOff, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Premium UI components
import SunlightBackground from '@/components/SunlightBackground';
import GlassPanel from '@/components/GlassPanel';
import VoiceOrb from '@/components/VoiceOrb';
import AppleMessageBubble from '@/components/AppleMessageBubble';
import AIAvatar from '@/components/AIAvatar';
import PremiumButton from '@/components/PremiumButton';
import FloatingText3D from '@/components/FloatingText3D';
import TrustBadge from '@/components/TrustBadge';

type OrbState = 'idle' | 'listening' | 'thinking' | 'muted' | 'error';

export default function SeniorPage() {
  const router = useRouter();
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [micLevel, setMicLevel] = useState(0.2);
  const [currentMessage, setCurrentMessage] = useState('Hello! Tap the button to talk to me.');
  const [showMessage, setShowMessage] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [screenContext, setScreenContext] = useState<string | null>(null);
  const [screenSummary, setScreenSummary] = useState<string>('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAnalyzingScreen, setIsAnalyzingScreen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonSuccess, setButtonSuccess] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const initializedRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setCurrentTranscript(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        const nonCriticalErrors = ['no-speech', 'audio-capture', 'network'];
        if (!nonCriticalErrors.includes(event.error)) {
          shouldKeepListeningRef.current = false;
          setOrbState('error');
          setTimeout(() => setOrbState('idle'), 2000);
        }
      };

      recognitionRef.current.onend = () => {
        if (!shouldKeepListeningRef.current) {
          setOrbState('idle');
        }
      };
    }

    // Initial greeting
    const greeting = 'Hello! I am your voice assistant. How can I help you today?';
    setCurrentMessage(greeting);
    setShowMessage(true);
    speak(greeting);

    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const showFloatingMessage = (text: string, duration: number = 5000) => {
    setCurrentMessage(text);
    setShowMessage(true);
    
    // Auto-hide after duration (except for listening state)
    if (duration > 0) {
      setTimeout(() => {
        if (orbState !== 'listening') {
          setShowMessage(false);
        }
      }, duration);
    }
  };

  const speak = async (text: string) => {
    if (typeof window === 'undefined') return;

    const ttsServerUrl = process.env.NEXT_PUBLIC_TTS_SERVER_URL || 'http://127.0.0.1:8765';
    
    try {
      setOrbState('thinking');
      
      // Stop any ongoing audio
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current.src = '';
        audioRef.current = null;
      }
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      const resp = await fetch(`${ttsServerUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'en' }),
      });
      
      if (!resp.ok) {
        throw new Error(`TTS server error: ${resp.status}`);
      }
      
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      // 🎯 SYNCHRONIZED TEXT REVEAL (like real conversation!)
      // Words appear AS they're spoken, not all at once - seniors are used to real conversations!
      const words = text.split(' ');
      const wordsPerSecond = 165 / 60; // 165 WPM = 2.75 words/second
      const msPerWord = 1000 / wordsPerSecond; // ~360ms per word
      
      let wordIndex = 0;
      const revealInterval = setInterval(() => {
        if (wordIndex < words.length) {
          const revealedText = words.slice(0, wordIndex + 1).join(' ');
          setCurrentMessage(revealedText);
          wordIndex++;
        } else {
          clearInterval(revealInterval);
        }
      }, msPerWord);
      
      audio.onended = () => { 
        clearInterval(revealInterval);
        setCurrentMessage(text); // Show full message
        setOrbState('idle');
        URL.revokeObjectURL(url); 
      };
      audio.onerror = (err) => { 
        clearInterval(revealInterval);
        console.error('Audio playback error:', err);
        setOrbState('idle');
        URL.revokeObjectURL(url); 
      };
      
      // Clear message before starting (important!)
      setCurrentMessage('');
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setOrbState('idle');
    }
  };

  const handleUserInput = async (transcript: string) => {
    if (!transcript.trim()) return;

    // Clear transcript and show thinking immediately
    setCurrentTranscript('');
    setCurrentMessage(''); // Clear any previous message
    setShowMessage(false); // Hide bubble during thinking
    setOrbState('thinking');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          history: [],
          screenContext: screenContext,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        const serverMsg = data?.message || 'I am having trouble right now. Please try again.';
        speak(serverMsg); // Synchronized reveal
        setShowMessage(true);
        setOrbState('idle');
        return;
      }

      if (data.message) {
        // Don't show message instantly - let speak() reveal it word-by-word!
        speak(data.message);
        setShowMessage(true); // Make sure message bubble is visible
      } else {
        setOrbState('idle');
      }
    } catch (error) {
      console.error('Error processing input:', error);
      const errorMsg = 'I am having trouble connecting. Please try again.';
      speak(errorMsg); // Synchronized reveal
      setShowMessage(true);
      setOrbState('idle');
    }
  };

  const handleOrbClick = () => {
    if (orbState === 'listening') {
      stopListening();
    } else if (orbState === 'idle') {
      startListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && orbState === 'idle') {
      setCurrentTranscript('');
      shouldKeepListeningRef.current = true;
      showFloatingMessage('Listening...', 0);
      
      try {
        recognitionRef.current.start();
        setOrbState('listening');
        
        // Simulate mic level fluctuations
        const interval = setInterval(() => {
          if (shouldKeepListeningRef.current) {
            setMicLevel(0.3 + Math.random() * 0.5);
          } else {
            clearInterval(interval);
            setMicLevel(0.2);
          }
        }, 100);
      } catch (err) {
        console.error('Error starting recognition:', err);
        shouldKeepListeningRef.current = false;
        setOrbState('error');
        showFloatingMessage('Microphone error. Please check permissions.', 3000);
        setTimeout(() => setOrbState('idle'), 2000);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && orbState === 'listening') {
      shouldKeepListeningRef.current = false;
      
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
      
      setOrbState('idle');
      setMicLevel(0.2);
      
      if (currentTranscript.trim()) {
        handleUserInput(currentTranscript);
      }
    }
  };

  const startScreenShare = async () => {
    setButtonLoading(true);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });

      mediaStreamRef.current = stream;

      // Success states
      setButtonLoading(false);
      setButtonSuccess(true);
      setIsScreenSharing(true);

      // Capture initial screenshot
      captureScreen(stream);

      // Set up auto-capture every 5 seconds
      const captureInterval = setInterval(() => {
        if (mediaStreamRef.current) {
          captureScreen(mediaStreamRef.current);
        } else {
          clearInterval(captureInterval);
        }
      }, 5000);

      // Clean up when screen share ends
      stream.getTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
        clearInterval(captureInterval);
      });
    } catch (err) {
      console.error('Screen share error:', err);
      setButtonLoading(false);
      setOrbState('error');
      setTimeout(() => setOrbState('idle'), 2000);
      alert('Could not start screen sharing. Please try again.');
    }
  };

  const stopScreenShare = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setButtonSuccess(false);
    setScreenContext(null);
    setScreenSummary('');
  };

  const captureScreen = async (stream: MediaStream) => {
    try {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setScreenContext(imageData);
        
        // Get AI analysis
        analyzeScreen(imageData);
      }
    } catch (err) {
      console.error('Screen capture error:', err);
    }
  };

  const analyzeScreen = async (imageData: string) => {
    try {
      setIsAnalyzingScreen(true);
      console.log('[Vision] Analyze screen called');
      
      // TEMPORARY: Disabled for debugging
      const message = 'I can see your screen now! What do you need help with?';
      setScreenSummary(message);
      showFloatingMessage(message, 0);
      
      /* 
      // Use FREE local computer vision analysis
      const { analyzeScreenshot } = await import('@/lib/vision/screen-analyzer');
      const analysis = await analyzeScreenshot(imageData);
      
      console.log('[Vision] Analysis result:', analysis);
      
      if (analysis.confidence > 0.5) {
        // Build confident message with UI guidance!
        let message = `I can see you are in ${analysis.application}! `;
        
        if (analysis.participants && analysis.participants > 0) {
          message += `There are ${analysis.participants} participants in the call. `;
        }
        
        // Add detailed UI guidance - WHERE buttons are!
        if (analysis.uiGuidance && analysis.uiGuidance.instructions.length > 0) {
          message += '\n\nLet me tell you where everything is:\n';
          message += analysis.uiGuidance.instructions.slice(0, 3).join('\n');
        } else if (analysis.suggestedHelp.length > 0) {
          const firstHelp = analysis.suggestedHelp[0];
          message += `Are you having trouble with the buttons? I can help you ${firstHelp.toLowerCase()}.`;
        }
        
        setScreenSummary(analysis.details);
        addMessage('assistant', `👁️ ${message}`);
        
        // Speak a simplified version
        const spokenMessage = `I can see you are in ${analysis.application}. ${
          analysis.uiGuidance?.instructions[0] || 'What do you need help with?'
        }`;
        speak(spokenMessage);
      } else {
        // Low confidence - ask for better view
        const message = 'I can see your screen but need a clearer view. Can you make sure the application window is fully visible?';
        setScreenSummary(analysis.details);
        addMessage('assistant', `👁️ ${message}`);
        speak(message);
      }
      */
    } catch (err) {
      console.error('Screen analysis error:', err);
      setScreenSummary('Unable to analyze screen');
    } finally {
      setIsAnalyzingScreen(false);
    }
  };

  const screenActions = [
    {
      label: 'Where are the buttons?',
      sublabel: 'Show me where to click',
      icon: <HelpCircle className="w-6 h-6" />,
      onClick: () => {
        setOrbState('thinking');
        handleUserInput('Where are the buttons? Where should I click?');
      },
    },
    {
      label: 'What should I do?',
      sublabel: 'Guide me step by step',
      icon: <HelpCircle className="w-6 h-6" />,
      onClick: () => {
        setOrbState('thinking');
        handleUserInput('What should I do next? Walk me through it.');
      },
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Ethereal Sunlight Background */}
      <SunlightBackground />
      
      {/* Top Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/50 border-b border-white/30 px-4 py-3"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-900 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full px-3 py-2 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-base font-medium">Back</span>
          </button>
          
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 absolute left-1/2 transform -translate-x-1/2">
            Voice Assistant
          </h1>
          
          <button
            className="flex items-center gap-2 text-slate-900 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full px-3 py-2 transition-all"
            onClick={() => alert('Help: Tap the voice button to speak. The assistant will help you with any questions.')}
          >
            <HelpCircle className="w-6 h-6" />
            <span className="text-base font-medium hidden sm:inline">Help</span>
          </button>
        </div>
      </motion.div>

      {/* Apple Intelligence Message Bubble */}
      <AppleMessageBubble
        message={currentMessage}
        transcript={currentTranscript}
        visible={showMessage}
      />

      {/* Main Content Area - Screen Insight Only */}
      <div className="pt-20 pb-64 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Centered Screen Insight Column */}
            <motion.div
              className="md:col-span-12 lg:col-span-8 lg:col-start-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {!isScreenSharing ? (
                <div className="flex flex-col items-center text-center space-y-8">
                  {/* Premium AI Avatar - 280px animated gradient orb */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 200 }}
                  >
                    <button
                      onClick={() => {
                        // Toggle between idle and listening for demo
                        setOrbState(orbState === 'idle' ? 'listening' : 'idle');
                      }}
                      className="focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-4 rounded-full transition-transform hover:scale-105 active:scale-95"
                      aria-label="AI assistant avatar"
                      style={{ outline: 'none' }}
                    >
                      <AIAvatar
                        state={orbState === 'muted' ? 'idle' : orbState === 'error' ? 'alert' : orbState}
                        audioLevel={micLevel}
                        size={280}
                      />
                    </button>
                  </motion.div>

                  {/* "Tap to talk" affordance */}
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-blue-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <span className="text-lg text-gray-600 font-normal">
                        Tap avatar or say &quot;Hey Helper&quot;
                      </span>
                    </div>
                  </motion.div>

                  {/* 3D Heading */}
                  <div className="space-y-4 w-full">
                    <FloatingText3D as="h2" size="h1" delay={0.4} className="flex items-center justify-center gap-3">
                      <Sparkles className="w-8 h-8 text-amber-500" aria-hidden="true" />
                      <span>AI Vision Assistant</span>
                    </FloatingText3D>

                    {/* Body text with high contrast */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <p className="text-xl md:text-2xl text-gray-900 leading-relaxed max-w-2xl mx-auto font-normal px-6">
                        Let me see your screen so I can provide real-time guidance. I&apos;ll explain buttons, read text, and walk you through any task.
                      </p>
                    </motion.div>
                  </div>

                  {/* Premium Button */}
                  <motion.div
                    className="w-full max-w-2xl"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <PremiumButton
                      onClick={startScreenShare}
                      loading={buttonLoading}
                      success={buttonSuccess}
                      icon="eye"
                    >
                      Enable AI Vision
                    </PremiumButton>
                  </motion.div>

                  {/* Trust Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 1.0 }}
                  >
                    <TrustBadge />
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-2xl font-bold mb-2">What I see on your screen</h3>
                    <p className="text-gray-600">{screenSummary || 'Analyzing your screen...'}</p>
                  </div>
                  <motion.button
                    onClick={stopScreenShare}
                    className="w-full bg-gradient-to-r from-rose-400 to-rose-500 text-white font-semibold rounded-xl px-6 py-3 shadow-lg hover:from-rose-500 hover:to-rose-600 focus-visible:ring-2 focus-visible:ring-teal-400 transition-all flex items-center justify-center gap-2"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <EyeOff className="w-5 h-5" />
                    Stop Screen Sharing
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Vision Badge - disabled during vision system rebuild */}

      {/* Bottom Controls - Simplified */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/70 border-t-2 border-transparent z-40"
        style={{
          borderImageSource: 'linear-gradient(to right, #fcd34d, #fda4af)',
          borderImageSlice: 1,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Empty space for balance */}
            <div className="w-24 hidden sm:block"></div>

            {/* Center: VoiceOrb with status text */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <button
                onClick={handleOrbClick}
                className="focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 rounded-full transition-all transform hover:scale-105 active:scale-95"
                aria-label="Voice assistant control"
              >
                <VoiceOrb level={micLevel} state={orbState} />
              </button>
              <p className="text-lg md:text-xl font-semibold text-slate-700 text-center">
                {orbState === 'idle' && 'Tap to talk'}
                {orbState === 'listening' && 'Listening...'}
                {orbState === 'thinking' && 'Thinking...'}
                {orbState === 'error' && 'Error - Try again'}
              </p>
            </div>

            {/* Right: End button */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-semibold rounded-full px-6 py-3 shadow-lg hover:from-rose-500 hover:to-rose-600 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 transition-all min-h-[48px]"
              aria-label="End conversation"
            >
              <X className="w-6 h-6" />
              <span className="text-base hidden sm:inline">End</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
