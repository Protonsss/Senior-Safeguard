'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'alert';

interface AIAvatarProps {
  state: AvatarState;
  audioLevel?: number; // 0-1 for audio visualization
  size?: number; // diameter in pixels
}

/**
 * AIAvatar - Premium animated gradient orb
 *
 * A living, breathing AI presence with:
 * - Rotating gradient (blue → cyan → purple → pink)
 * - State-based animations (idle, listening, thinking, speaking, alert)
 * - Floating particles
 * - Dynamic glow effects
 * - 3D depth with shadows
 * - Audio-reactive visualization
 *
 * Designed to feel alive, trustworthy, and premium like Apple Vision Pro
 */
export default function AIAvatar({ state, audioLevel = 0.2, size = 280 }: AIAvatarProps) {
  const shouldReduceMotion = useReducedMotion();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Generate particles on mount
  useEffect(() => {
    const particleCount = state === 'listening' ? 20 : 8;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, [state]);

  // Color schemes for each state
  const stateColors = {
    idle: {
      gradient: 'linear-gradient(135deg, #0066FF 0%, #00D9FF 33%, #9D4EDD 66%, #FF006E 100%)',
      glow: 'rgba(0, 102, 255, 0.6)',
      rotation: 20, // seconds per full rotation
    },
    listening: {
      gradient: 'linear-gradient(135deg, #00D9FF 0%, #00FF88 50%, #00D9FF 100%)',
      glow: 'rgba(0, 255, 136, 0.8)',
      rotation: 8,
    },
    thinking: {
      gradient: 'linear-gradient(135deg, #FFB800 0%, #FFEB3B 50%, #FFB800 100%)',
      glow: 'rgba(255, 235, 59, 0.7)',
      rotation: 8,
    },
    speaking: {
      gradient: 'linear-gradient(135deg, #00E676 0%, #00C853 33%, #00E676 66%, #00C853 100%)',
      glow: 'rgba(0, 230, 118, 0.6)',
      rotation: 12,
    },
    alert: {
      gradient: 'linear-gradient(135deg, #FF3B30 0%, #FF9500 50%, #FF3B30 100%)',
      glow: 'rgba(255, 59, 48, 0.9)',
      rotation: 0.5,
    },
  };

  const colors = stateColors[state];

  // Breathing animation scale
  const breathingScale = {
    idle: { from: 1.0, to: 1.08, duration: 3 },
    listening: { from: 1.0, to: 1.0 + audioLevel * 0.2, duration: 0.1 },
    thinking: { from: 1.0, to: 1.05, duration: 0.8 },
    speaking: { from: 1.0, to: 1.0 + audioLevel * 0.15, duration: 0.2 },
    alert: { from: 1.0, to: 1.2, duration: 0.5 },
  }[state];

  // Particle animation parameters
  const particleSpeed = {
    idle: 4,
    listening: 1.5,
    thinking: 2,
    speaking: 2.5,
    alert: 0.8,
  }[state];

  if (shouldReduceMotion) {
    // Simplified version for reduced motion
    return (
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: colors.gradient,
          boxShadow: `0 0 40px ${colors.glow}`,
        }}
      >
        <div className="w-4 h-4 bg-white rounded-full opacity-80" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Layer 1 (Back): Soft shadow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: 'rgba(0, 0, 0, 0.2)',
          filter: 'blur(60px)',
        }}
        animate={{
          y: [20, 25, 20],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Outer glow (pulsing) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size + 40,
          height: size + 40,
          background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: state === 'idle' ? [0.6, 0.8, 0.6] : [0.7, 1, 0.7],
          scale: state === 'alert' ? [1, 1.1, 1] : [1, 1.05, 1],
        }}
        transition={{
          duration: state === 'alert' ? 0.5 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Ripple rings (listening and alert states) */}
      {(state === 'listening' || state === 'alert') && (
        <>
          <motion.div
            className="absolute rounded-full border-2"
            style={{
              width: size,
              height: size,
              borderColor: state === 'alert' ? '#FF3B30' : '#00D9FF',
            }}
            initial={{ scale: 1.0, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute rounded-full border-2"
            style={{
              width: size,
              height: size,
              borderColor: state === 'alert' ? '#FF9500' : '#00FF88',
            }}
            initial={{ scale: 1.0, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.4,
            }}
          />
        </>
      )}

      {/* Layer 2 (Middle): Main orb with gradient */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: size,
          height: size,
          background: colors.gradient,
          boxShadow: `
            0 2px 4px rgba(0,0,0,0.1),
            0 8px 16px rgba(0,0,0,0.08),
            0 16px 32px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.3)
          `,
        }}
        animate={{
          scale: [breathingScale.from, breathingScale.to, breathingScale.from],
          rotate: state === 'alert' ? [0, -3, 3, -3, 0] : 360,
        }}
        transition={state === 'alert'
          ? { duration: 0.5, repeat: Infinity }
          : {
            scale: {
              duration: breathingScale.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            rotate: {
              duration: colors.rotation,
              repeat: Infinity,
              ease: 'linear',
            },
          }
        }
      >
        {/* Gradient rotation overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: colors.gradient,
            mixBlendMode: 'overlay',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: colors.rotation * 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: state === 'listening' ? 0.8 : 0.5,
            }}
            animate={{
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: particleSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: particle.delay,
            }}
          />
        ))}

        {/* Thinking state: Three dots */}
        {state === 'thinking' && (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                animate={{
                  y: [-4, 4, -4],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}

        {/* Audio visualization (speaking state) */}
        {state === 'speaking' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width={size * 0.5}
              height={size * 0.5}
              viewBox="0 0 100 100"
              className="text-white opacity-80"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.rect
                  key={i}
                  x={10 + i * 18}
                  y={50 - audioLevel * 30}
                  width={12}
                  height={audioLevel * 60 || 20}
                  fill="currentColor"
                  rx={2}
                  animate={{
                    height: [20, audioLevel * 60 || 40, 20],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                />
              ))}
            </svg>
          </div>
        )}
      </motion.div>

      {/* Layer 3 (Front): Highlight/lens flare */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          top: size * 0.15,
          left: size * 0.15,
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%)',
        }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
