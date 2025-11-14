'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Phone } from 'lucide-react';

interface ScamProtectionAlertProps {
  /** Is the alert active? */
  isActive: boolean;
  /** The danger message */
  title: string;
  /** Explanation in Dorothy's language */
  message: string;
  /** Primary action - get me out */
  onGetOut: () => void;
  /** Secondary action - call my daughter */
  onCallForHelp?: () => void;
}

/**
 * Scam Protection Alert - THE RED SHIELD
 *
 * When Dorothy is about to make a mistake, this SLAMS down.
 * Urgent. Protective. Like grabbing her hand before she steps into traffic.
 *
 * Not polite. URGENT. But calm. "I've got you. You're safe."
 */
export default function ScamProtectionAlert({
  isActive,
  title,
  message,
  onGetOut,
  onCallForHelp,
}: ScamProtectionAlertProps) {
  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* LAYER 1: Red veil - everything behind is dangerous */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(239, 68, 68, 0.20) 100%)',
            backdropFilter: 'blur(12px) grayscale(0.7)',
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Vignette effect - darker at edges */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
          }}
        />

        {/* Warning particles floating upward */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              background: 'rgba(239, 68, 68, 0.6)',
              left: `${Math.random() * 100}%`,
              bottom: 0,
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
            }}
            animate={{
              y: [-100, -window.innerHeight],
              opacity: [0, 0.8, 0],
              x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* LAYER 2: Alert container */}
        <motion.div
          className="relative w-full max-w-3xl"
          initial={{ scale: 0.8, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 200,
          }}
        >
          {/* LAYER 3: Massive 3D shield icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 100,
                delay: 0.1,
              }}
            >
              {/* Shield glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  width: 360,
                  height: 360,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Concentric warning rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute rounded-full border-4"
                  style={{
                    width: 320,
                    height: 320,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                  }}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: i * 0.8,
                  }}
                />
              ))}

              {/* Shield icon with 3D effect */}
              <motion.div
                className="relative"
                style={{
                  filter: 'drop-shadow(0 40px 80px rgba(239, 68, 68, 0.9)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8))',
                }}
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="rounded-3xl flex items-center justify-center"
                  style={{
                    width: 300,
                    height: 350,
                    background: 'linear-gradient(135deg, #FCA5A5 0%, #F87171 20%, #EF4444 50%, #DC2626 80%, #B91C1C 100%)',
                    boxShadow: `
                      inset 0 4px 12px rgba(255, 255, 255, 0.4),
                      inset 0 -4px 12px rgba(0, 0, 0, 0.3)
                    `,
                  }}
                >
                  <Shield size={180} className="text-white" strokeWidth={2.5} />

                  {/* Glossy highlight */}
                  <div
                    className="absolute top-0 left-0 right-0 h-32 rounded-t-3xl"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* LAYER 4: Alert text - COMMANDING */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {/* Main title - STOP */}
            <motion.h1
              className="font-black text-white mb-6 select-none"
              style={{
                fontSize: '72px',
                lineHeight: '1.1',
                textShadow: `
                  0 4px 8px rgba(0, 0, 0, 0.9),
                  0 12px 28px rgba(0, 0, 0, 0.7),
                  0 0 40px rgba(239, 68, 68, 0.6),
                  4px 4px 0 rgba(220, 38, 38, 0.8)
                `,
                WebkitTextStroke: '3px rgba(220, 38, 38, 0.5)',
              }}
              animate={{
                x: [0, -4, 4, -4, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              {title}
            </motion.h1>

            {/* Explanation */}
            <motion.div
              className="inline-block px-12 py-6 rounded-3xl"
              style={{
                background: 'rgba(220, 38, 38, 0.95)',
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p
                className="text-white font-bold"
                style={{
                  fontSize: '36px',
                  lineHeight: '1.4',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                }}
              >
                {message}
              </p>
            </motion.div>
          </motion.div>

          {/* LAYER 5: Action buttons - MASSIVE */}
          <motion.div
            className="space-y-5"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {/* Primary: GET ME OUT */}
            <motion.button
              onClick={onGetOut}
              className="w-full rounded-3xl px-12 py-8 font-black text-black text-3xl flex items-center justify-center gap-4 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #86EFAC 0%, #4ADE80 50%, #22C55E 100%)',
                boxShadow: '0 16px 48px rgba(34, 197, 94, 0.6), 0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: [
                  '0 16px 48px rgba(34, 197, 94, 0.6), 0 8px 24px rgba(0, 0, 0, 0.3)',
                  '0 20px 60px rgba(34, 197, 94, 0.8), 0 10px 30px rgba(0, 0, 0, 0.4)',
                  '0 16px 48px rgba(34, 197, 94, 0.6), 0 8px 24px rgba(0, 0, 0, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <X size={40} strokeWidth={3} />
              GET ME OUT OF HERE
            </motion.button>

            {/* Secondary: Call for help */}
            {onCallForHelp && (
              <motion.button
                onClick={onCallForHelp}
                className="w-full rounded-3xl px-12 py-7 font-bold text-blue-700 text-2xl flex items-center justify-center gap-4 bg-white border-4 border-blue-600"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <Phone size={32} strokeWidth={2.5} />
                LET MY FAMILY CHECK THIS
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
