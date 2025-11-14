'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DorothysOrb from '@/components/DorothysOrb';
import GuidanceOverlay from '@/components/GuidanceOverlay';
import ScamProtectionAlert from '@/components/ScamProtectionAlert';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'celebrating' | 'protecting';

/**
 * Dorothy's Interface - Designed from a Senior's Heart
 *
 * What Dorothy, 76, actually wants:
 * - A helper who's ALWAYS there
 * - Someone who explains things simply
 * - Someone who SHOWS her exactly where to click
 * - Someone who protects her from danger
 * - Something that feels warm and human
 * - To feel CONFIDENT, not afraid
 *
 * This is that interface.
 */
export default function DorothyPage() {
  const router = useRouter();
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [audioLevel, setAudioLevel] = useState(0.2);
  const [greeting, setGreeting] = useState('');
  const [userSpeech, setUserSpeech] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);
  const [showScamAlert, setShowScamAlert] = useState(false);

  const recognitionRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // Get user's name from localStorage or use a default
  const [userName, setUserName] = useState('there');

  useEffect(() => {
    // Try to get user's name
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('seniorName');
      if (savedName) {
        setUserName(savedName);
      }
    }
  }, []);

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

        setUserSpeech(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (!['no-speech', 'audio-capture', 'network'].includes(event.error)) {
          setOrbState('idle');
        }
      };

      recognitionRef.current.onend = () => {
        if (orbState === 'listening') {
          setOrbState('idle');
        }
      };
    }

    // Initial greeting
    const greetingText = `Hi ${userName}. I'm here to help you with anything you need.`;
    setGreeting(greetingText);
    speakDorothy(greetingText);

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak in Dorothy's warm, patient voice
  const speakDorothy = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a warm, friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.includes('Samantha') ||
      v.name.includes('Victoria') ||
      v.name.includes('Karen') ||
      (v.lang.startsWith('en') && v.name.includes('Female'))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.85; // Slower - easier to understand
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setOrbState('speaking');
    utterance.onend = () => setOrbState('idle');

    // Simulate audio level during speech
    const interval = setInterval(() => {
      setAudioLevel(0.3 + Math.random() * 0.5);
    }, 100);

    utterance.onend = () => {
      clearInterval(interval);
      setOrbState('idle');
      setAudioLevel(0.2);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) return;

    setOrbState('listening');
    setUserSpeech('');

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }
  };

  // Stop listening and process
  const stopListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch {}

    if (userSpeech.trim()) {
      setOrbState('thinking');

      // Process the speech (this would call your AI backend)
      setTimeout(() => {
        const response = processUserRequest(userSpeech);
        setAssistantResponse(response);
        speakDorothy(response);
      }, 1000);
    } else {
      setOrbState('idle');
    }
  };

  // Simple request processing (would be your AI backend)
  const processUserRequest = (speech: string): string => {
    const lowerSpeech = speech.toLowerCase();

    // Check for email requests
    if (lowerSpeech.includes('email') || lowerSpeech.includes('mail')) {
      // Show guidance overlay
      setTimeout(() => {
        setShowGuidance(true);
      }, 1000);
      return "Of course! Let me help you open your email. I can see you're using Gmail. Let me show you exactly where to click.";
    }

    // Check for suspicious/scam patterns
    if (lowerSpeech.includes('bank') && lowerSpeech.includes('urgent')) {
      setTimeout(() => {
        setShowScamAlert(true);
        setOrbState('protecting');
      }, 500);
      return "Wait! This doesn't look right. Let me check this for you.";
    }

    // Check for celebration
    if (lowerSpeech.includes('sent') || lowerSpeech.includes('done')) {
      setOrbState('celebrating');
      setTimeout(() => setOrbState('idle'), 3000);
      return `${userName}, you did that PERFECTLY! I'm so proud of you.`;
    }

    // Default helpful response
    return "I'm here to help. Can you tell me more about what you need?";
  };

  // Handle orb click/tap - toggle listening
  const handleOrbInteraction = () => {
    if (orbState === 'listening') {
      stopListening();
    } else if (orbState === 'idle') {
      startListening();
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-6">

      {/* The Orb - The ONLY thing Dorothy sees at first */}
      <div className="flex flex-col items-center justify-center space-y-12 max-w-4xl">

        {/* Living, breathing orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="cursor-pointer"
          onClick={handleOrbInteraction}
          role="button"
          aria-label={orbState === 'listening' ? 'Stop listening' : 'Start talking to me'}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOrbInteraction();
            }
          }}
        >
          <DorothysOrb state={orbState} audioLevel={audioLevel} size={320} />
        </motion.div>

        {/* Simple greeting text - LARGE, clear, black on white */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p
            className="text-gray-900 font-normal leading-relaxed"
            style={{
              fontSize: '42px', // HUGE - Dorothy can read from across the room
              maxWidth: '800px',
              letterSpacing: '0.01em',
            }}
          >
            {greeting}
          </p>

          {/* Simple instruction - appears when idle */}
          {orbState === 'idle' && (
            <motion.p
              className="text-gray-600 font-normal"
              style={{
                fontSize: '28px',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Tap the light or just start talking
            </motion.p>
          )}

          {/* User's words appear in real-time - BIG letters */}
          {userSpeech && orbState === 'listening' && (
            <motion.div
              className="bg-blue-50 rounded-3xl px-8 py-6 border-2 border-blue-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p
                className="text-gray-900 font-medium"
                style={{
                  fontSize: '36px',
                  lineHeight: '1.4',
                }}
              >
                &quot;{userSpeech}&quot;
              </p>
            </motion.div>
          )}

          {/* Assistant's response */}
          {assistantResponse && orbState === 'speaking' && (
            <motion.div
              className="bg-green-50 rounded-3xl px-8 py-6 border-2 border-green-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p
                className="text-gray-900 font-medium"
                style={{
                  fontSize: '36px',
                  lineHeight: '1.4',
                }}
              >
                {assistantResponse}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 3D Guidance Overlay - Shows Dorothy where to click */}
      <GuidanceOverlay
        isActive={showGuidance}
        instruction="CLICK HERE TO WRITE A NEW EMAIL"
        targetPosition={
          showGuidance
            ? { x: window.innerWidth / 2 - 60, y: window.innerHeight / 3, width: 120, height: 60 }
            : undefined
        }
        onDismiss={() => {
          setShowGuidance(false);
          setOrbState('celebrating');
          speakDorothy("Perfect! You found it. Now you can write your email.");
          setTimeout(() => setOrbState('idle'), 3000);
        }}
      />

      {/* Scam Protection Alert - The red shield */}
      <ScamProtectionAlert
        isActive={showScamAlert}
        title="⛔ STOP RIGHT NOW ⛔"
        message="THIS WEBSITE IS FAKE. IT'S TRYING TO STEAL YOUR MONEY."
        onGetOut={() => {
          setShowScamAlert(false);
          setOrbState('idle');
          router.push('/');
        }}
        onCallForHelp={() => {
          // Would trigger call to emergency contact
          alert('Calling your emergency contact...');
        }}
      />
    </div>
  );
}
