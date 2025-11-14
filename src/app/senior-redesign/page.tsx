'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

// Premium components
import AIAvatar from '@/components/AIAvatar';
import PremiumButton from '@/components/PremiumButton';
import FloatingText3D from '@/components/FloatingText3D';
import TrustBadge from '@/components/TrustBadge';
import PremiumGlassCard from '@/components/PremiumGlassCard';

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'alert';

/**
 * Senior Voice Assistant - Redesigned
 *
 * THE WORLD'S FIRST AI THAT LIVES INSIDE SOMEONE'S SCREEN
 *
 * Features:
 * - Living, breathing AI avatar (280px animated gradient orb)
 * - Enterprise-grade UI that says "$5M system"
 * - WCAG AAA contrast (seniors can actually read it)
 * - Irresistible premium button
 * - Choreographed entrance animations
 * - Fully accessible (keyboard nav, screen reader, reduced motion)
 * - Responsive (mobile, tablet, desktop)
 */
export default function SeniorRedesignPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [audioLevel, setAudioLevel] = useState(0.2);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonSuccess, setButtonSuccess] = useState(false);

  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Simulate audio level fluctuations for demo
  useEffect(() => {
    if (avatarState === 'listening' || avatarState === 'speaking') {
      const interval = setInterval(() => {
        setAudioLevel(0.3 + Math.random() * 0.5);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0.2);
    }
  }, [avatarState]);

  const handleEnableVision = async () => {
    setButtonLoading(true);

    try {
      // Request screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });

      mediaStreamRef.current = stream;

      // Success state
      setButtonLoading(false);
      setButtonSuccess(true);
      setIsScreenSharing(true);
      setAvatarState('listening');

      // Clean up when screen share ends
      stream.getTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

      // Speak success message
      setTimeout(() => {
        setAvatarState('speaking');
        setTimeout(() => setAvatarState('listening'), 2000);
      }, 1000);
    } catch (err) {
      console.error('Screen share error:', err);
      setButtonLoading(false);
      setAvatarState('alert');
      setTimeout(() => setAvatarState('idle'), 2000);
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
    setAvatarState('idle');
  };

  const handleAvatarClick = () => {
    if (avatarState === 'idle') {
      setAvatarState('listening');
    } else if (avatarState === 'listening') {
      setAvatarState('thinking');
      setTimeout(() => setAvatarState('speaking'), 1500);
      setTimeout(() => setAvatarState('idle'), 4000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Pure white to soft pearl gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
          }}
        />

        {/* Radial gradient emanating from center (makes avatar glow) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(0,102,255,0.08), transparent 60%)',
          }}
        />

        {/* Animated gradient orbs in background */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(0,217,255,0.4), transparent)' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(157,78,221,0.4), transparent)' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
          </>
        )}
      </div>

      {/* Top Navigation */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 px-5 py-5 md:px-10 md:py-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4, ease: 'easeOut' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Back button */}
          <motion.button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-900 hover:text-gray-700 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded-full px-4 py-3 transition-colors bg-white/40 backdrop-blur-sm hover:bg-white/60"
            style={{ minWidth: 44, minHeight: 44 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg font-medium hidden sm:inline">Back</span>
          </motion.button>

          {/* Help button */}
          <motion.button
            className="flex items-center gap-2 text-gray-900 hover:text-gray-700 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded-full px-4 py-3 transition-colors bg-white/40 backdrop-blur-sm hover:bg-white/60"
            style={{ minWidth: 44, minHeight: 44 }}
            onClick={() => alert('Help: Enable AI Vision to get real-time guidance. The AI will explain buttons, read text, and walk you through any task.')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Get help"
          >
            <HelpCircle className="w-6 h-6" />
            <span className="text-lg font-medium hidden sm:inline">Help</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-32">
        <div className="max-w-4xl w-full">
          {!isScreenSharing ? (
            /* ENABLE AI VISION SCREEN */
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Animated AI Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 200 }}
              >
                <button
                  onClick={handleAvatarClick}
                  className="focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-4 rounded-full transition-transform hover:scale-105 active:scale-95"
                  aria-label="AI assistant avatar"
                  style={{ outline: 'none' }}
                >
                  <AIAvatar state={avatarState} audioLevel={audioLevel} size={280} />
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
                  {/* Tap gesture animation */}
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

              {/* Heading with 3D effect */}
              <div className="space-y-4">
                <FloatingText3D as="h1" size="h1" delay={0.4} className="flex items-center justify-center gap-3">
                  <Sparkles className="w-8 h-8 text-amber-500" aria-hidden="true" />
                  <span>AI Vision Assistant</span>
                </FloatingText3D>

                {/* Body text */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <p className="text-xl md:text-2xl text-gray-800 leading-relaxed max-w-2xl mx-auto font-normal px-6 py-4">
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
                  onClick={handleEnableVision}
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
            /* SCREEN SHARING ACTIVE */
            <PremiumGlassCard className="p-8 text-center space-y-6">
              <AIAvatar state={avatarState} audioLevel={audioLevel} size={200} />

              <FloatingText3D as="h2" size="h2">
                I can see your screen!
              </FloatingText3D>

              <p className="text-xl text-gray-800 leading-relaxed max-w-md mx-auto">
                I&apos;m watching and ready to help. Just ask me anything about what you see on your screen.
              </p>

              <motion.button
                onClick={stopScreenShare}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl focus-visible:ring-4 focus-visible:ring-rose-400 focus-visible:ring-offset-2 transition-all text-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Stop Screen Sharing
              </motion.button>
            </PremiumGlassCard>
          )}
        </div>
      </div>

      {/* Optional: Status indicator when screen sharing */}
      {isScreenSharing && (
        <motion.div
          className="fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-green-500 text-white shadow-lg"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-semibold">AI Vision Active</span>
        </motion.div>
      )}
    </div>
  );
}
