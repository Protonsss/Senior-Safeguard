'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

type OrbState = 'idle' | 'listening' | 'thinking' | 'muted' | 'error';

interface VoiceOrbProps {
  level: number; // 0..1 mic RMS level
  state: OrbState;
}

/**
 * VoiceOrb
 * Premium voice orb with pulse rings, glow aura, and state animations
 * Matches ChatGPT 5 professional feel
 */
export default function VoiceOrb({ level, state }: VoiceOrbProps) {
  const shouldReduceMotion = useReducedMotion();
  const [glowOpacity, setGlowOpacity] = useState(0);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (state === 'listening' && !shouldReduceMotion) {
      // Map level 0..1 → scale 1.00..1.12 and glow 0..0.35
      setScale(1.0 + level * 0.12);
      setGlowOpacity(level * 0.35);
    } else {
      setScale(1.0);
      setGlowOpacity(0);
    }
  }, [level, state, shouldReduceMotion]);

  const orbClasses = state === 'muted' 
    ? 'grayscale opacity-60' 
    : state === 'error'
    ? 'ring-2 ring-red-500'
    : '';

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Glow aura underneath */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(253, 230, 138, 0.6), rgba(251, 207, 232, 0.4), transparent)',
        }}
        animate={{ opacity: glowOpacity }}
        transition={{ duration: 0.3 }}
      />

      {/* Pulse rings - only in listening state */}
      {state === 'listening' && !shouldReduceMotion && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-300"
            initial={{ scale: 1.0, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              ease: 'easeOut',
              delay: 0
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-rose-300"
            initial={{ scale: 1.0, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              ease: 'easeOut',
              delay: 0.3
            }}
          />
        </>
      )}

      {/* Core orb */}
      <motion.div
        className={`relative w-24 h-24 rounded-full ring-1 ring-white/50 shadow-xl ${orbClasses}`}
        style={{
          background: 'radial-gradient(circle at 30% 30%, white, #fde68a, #fbcfe8)',
        }}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        {/* Thinking state: rotating conic sweep */}
        {state === 'thinking' && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Muted: strike glyph */}
        {state === 'muted' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-0.5 bg-slate-900 rotate-45" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

