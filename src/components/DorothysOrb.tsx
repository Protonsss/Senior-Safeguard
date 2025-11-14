'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'celebrating' | 'protecting';

interface DorothysOrbProps {
  state: OrbState;
  audioLevel?: number; // 0-1 for breathing/audio visualization
  size?: number;
}

/**
 * Dorothy's Orb - A living, breathing presence
 *
 * Not a cartoon. Not a robot. A beautiful glowing sphere of light.
 * Like a sun made of glass. Breathing. Alive.
 *
 * This is the ONLY interface Dorothy needs to see at first.
 * Everything else comes from this orb.
 */
export default function DorothysOrb({ state, audioLevel = 0.2, size = 320 }: DorothysOrbProps) {
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; distance: number; delay: number }>>([]);

  // Generate orbiting particles
  useEffect(() => {
    const particleCount = state === 'listening' ? 24 : state === 'celebrating' ? 40 : 12;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i / particleCount) * 360,
      distance: 0.6 + Math.random() * 0.4,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, [state]);

  // State configurations
  const stateConfig = {
    idle: {
      // Calm blue to purple gradient - peaceful, welcoming
      gradient: 'radial-gradient(circle at 30% 30%, #60A5FA 0%, #818CF8 30%, #A78BFA 60%, #C084FC 100%)',
      glowColor: 'rgba(96, 165, 250, 0.6)',
      breathDuration: 4, // Slow, calm breathing
      breathScale: { from: 1.0, to: 1.12 },
      particleColor: 'rgba(255, 255, 255, 0.7)',
    },
    listening: {
      // Bright cyan to green - active, engaged, "I hear you"
      gradient: 'radial-gradient(circle at 30% 30%, #22D3EE 0%, #06B6D4 30%, #14B8A6 60%, #0D9488 100%)',
      glowColor: 'rgba(34, 211, 238, 0.8)',
      breathDuration: 1.5, // Faster breathing - alive and listening
      breathScale: { from: 1.0, to: 1.0 + audioLevel * 0.25 },
      particleColor: 'rgba(255, 255, 255, 0.9)',
    },
    thinking: {
      // Warm amber to yellow - processing, working for you
      gradient: 'radial-gradient(circle at 30% 30%, #FCD34D 0%, #FBBF24 30%, #F59E0B 60%, #D97706 100%)',
      glowColor: 'rgba(252, 211, 77, 0.7)',
      breathDuration: 1.0, // Pulsing - thinking actively
      breathScale: { from: 1.0, to: 1.08 },
      particleColor: 'rgba(255, 255, 255, 0.8)',
    },
    speaking: {
      // Soft green gradient - calm, explaining, helpful
      gradient: 'radial-gradient(circle at 30% 30%, #86EFAC 0%, #4ADE80 30%, #22C55E 60%, #16A34A 100%)',
      glowColor: 'rgba(74, 222, 128, 0.7)',
      breathDuration: 0.3, // Quick pulses with speech
      breathScale: { from: 1.0, to: 1.0 + audioLevel * 0.18 },
      particleColor: 'rgba(255, 255, 255, 0.85)',
    },
    celebrating: {
      // Golden warm glow - "You did it!"
      gradient: 'radial-gradient(circle at 30% 30%, #FDE047 0%, #FACC15 30%, #EAB308 60%, #CA8A04 100%)',
      glowColor: 'rgba(253, 224, 71, 0.9)',
      breathDuration: 0.8,
      breathScale: { from: 1.0, to: 1.15 },
      particleColor: 'rgba(255, 255, 255, 1)',
    },
    protecting: {
      // Urgent red - "STOP. I'm protecting you."
      gradient: 'radial-gradient(circle at 30% 30%, #FCA5A5 0%, #F87171 30%, #EF4444 60%, #DC2626 100%)',
      glowColor: 'rgba(239, 68, 68, 0.95)',
      breathDuration: 0.6, // Rapid urgent pulsing
      breathScale: { from: 1.0, to: 1.2 },
      particleColor: 'rgba(255, 255, 255, 0.95)',
    },
  };

  const config = stateConfig[state];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>

      {/* LAYER 1 (Deepest): Ground shadow - creates sense of floating */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.8,
          height: size * 0.3,
          bottom: -size * 0.15,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: config.breathDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* LAYER 2: Atmospheric glow - massive soft halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 60%)`,
          filter: 'blur(80px)',
        }}
        animate={{
          opacity: state === 'protecting' ? [0.7, 1, 0.7] : [0.4, 0.7, 0.4],
          scale: state === 'protecting' ? [1, 1.15, 1] : [1, 1.08, 1],
        }}
        transition={{
          duration: state === 'protecting' ? 0.6 : config.breathDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* LAYER 3: Ripple rings (listening and protecting states only) */}
      {(state === 'listening' || state === 'protecting') && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full border-2"
              style={{
                width: size,
                height: size,
                borderColor: state === 'protecting' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 211, 238, 0.6)',
              }}
              initial={{ scale: 1.0, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </>
      )}

      {/* LAYER 4: Main orb body - the living sphere */}
      <motion.div
        className="relative rounded-full overflow-visible"
        style={{
          width: size,
          height: size,
          background: config.gradient,
          boxShadow: `
            0 10px 40px rgba(0, 0, 0, 0.15),
            0 30px 90px rgba(0, 0, 0, 0.12),
            0 50px 140px ${config.glowColor},
            inset 0 2px 8px rgba(255, 255, 255, 0.4),
            inset 0 -2px 8px rgba(0, 0, 0, 0.15)
          `,
        }}
        animate={{
          scale: [config.breathScale.from, config.breathScale.to, config.breathScale.from],
          y: state === 'protecting' ? [0, -8, 0, -8, 0] : [0, -10, 0],
        }}
        transition={{
          scale: {
            duration: config.breathDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          y: {
            duration: state === 'protecting' ? 0.6 : 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Glossy highlight - makes it look like glass/crystal */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            top: size * 0.1,
            left: size * 0.15,
            background: 'radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3) 40%, transparent 60%)',
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Inner light - depth perception */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.3), transparent 50%)',
          }}
        />
      </motion.div>

      {/* LAYER 5: Orbiting particles - creates life and motion */}
      {particles.map((particle) => {
        const x = Math.cos((particle.angle * Math.PI) / 180) * (size / 2) * particle.distance;
        const y = Math.sin((particle.angle * Math.PI) / 180) * (size / 2) * particle.distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: state === 'celebrating' ? 6 : 4,
              height: state === 'celebrating' ? 6 : 4,
              background: config.particleColor,
              boxShadow: `0 0 8px ${config.particleColor}`,
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [x, x * 1.2, x],
              y: [y, y * 1.2, y],
              opacity: state === 'celebrating' ? [0.6, 1, 0.6] : [0.4, 0.8, 0.4],
              scale: state === 'celebrating' ? [1, 1.5, 1] : [1, 1.2, 1],
            }}
            transition={{
              duration: state === 'celebrating' ? 1.5 : 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: particle.delay,
            }}
          />
        );
      })}

      {/* LAYER 6: Sparkles for celebration state */}
      {state === 'celebrating' && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                fontSize: '24px',
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: (Math.random() - 0.5) * size * 1.5,
                y: -Math.random() * size * 1.2,
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: i * 0.15,
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}

      {/* LAYER 7: Thinking dots */}
      {state === 'thinking' && (
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-full bg-white"
              style={{
                width: 12,
                height: 12,
                boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
              }}
              animate={{
                y: [-8, 8, -8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
