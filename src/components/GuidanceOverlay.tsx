'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GuidanceOverlayProps {
  /** Is the overlay active? */
  isActive: boolean;
  /** The instruction text in HUGE letters */
  instruction: string;
  /** Target element position (where to click) */
  targetPosition?: { x: number; y: number; width: number; height: number };
  /** Callback when user dismisses */
  onDismiss?: () => void;
}

/**
 * Guidance Overlay - Hyper-Realistic 3D Floating Instructions
 *
 * When Dorothy needs to click something, THIS appears.
 * Everything else dims. A glowing circle floats above the target.
 * HUGE 3D text tells her exactly what to do.
 *
 * Impossible to miss. Feels like magic.
 */
export default function GuidanceOverlay({
  isActive,
  instruction,
  targetPosition,
  onDismiss,
}: GuidanceOverlayProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Generate sparkles around the target circle
  useEffect(() => {
    if (!isActive || !targetPosition) return;

    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: targetPosition.x + targetPosition.width / 2,
      y: targetPosition.y + targetPosition.height / 2,
    }));
    setSparkles(newSparkles);
  }, [isActive, targetPosition]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          pointerEvents: 'none', // Don't block clicks except on target
        }}
      >
        {/* LAYER 1: Dark veil - everything recedes */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* LAYER 2: The instruction text - MASSIVE 3D letters floating */}
        <motion.div
          className="absolute top-[15%] left-1/2 transform -translate-x-1/2"
          style={{
            perspective: '1200px',
            pointerEvents: 'none',
          }}
          initial={{ y: -100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
        >
          <motion.div
            style={{
              transform: 'rotateX(-8deg)',
              transformStyle: 'preserve-3d',
            }}
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="text-white font-black text-center px-8 select-none"
              style={{
                fontSize: '56px',
                lineHeight: '1.2',
                letterSpacing: '0.02em',
                textShadow: `
                  0 4px 8px rgba(0, 0, 0, 0.8),
                  0 12px 24px rgba(0, 0, 0, 0.6),
                  0 24px 48px rgba(0, 0, 0, 0.4),
                  0 0 40px rgba(255, 255, 255, 0.3),
                  2px 2px 0 rgba(255, 255, 255, 0.1),
                  4px 4px 0 rgba(0, 0, 0, 0.3)
                `,
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
                maxWidth: '900px',
              }}
            >
              {instruction}
            </div>
          </motion.div>
        </motion.div>

        {/* LAYER 3: Animated arrow pointing to target */}
        {targetPosition && (
          <motion.svg
            className="absolute"
            style={{
              left: targetPosition.x + targetPosition.width / 2 - 100,
              top: targetPosition.y - 120,
              width: 200,
              height: 100,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <defs>
              <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FDE047" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 100 10 Q 100 50, 100 80 L 100 90 M 100 90 L 90 80 M 100 90 L 110 80"
              stroke="url(#arrow-gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: [0, 1, 1],
                y: [0, 10, 0],
              }}
              transition={{
                pathLength: { duration: 0.8, delay: 0.7 },
                opacity: { duration: 0.4, delay: 0.7 },
                y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          </motion.svg>
        )}

        {/* LAYER 4: The target circle - FLOATING HOLOGRAM */}
        {targetPosition && (
          <>
            {/* Main glowing circle */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: targetPosition.x + targetPosition.width / 2 - 75,
                top: targetPosition.y + targetPosition.height / 2 - 75,
                width: 150,
                height: 150,
                background: 'radial-gradient(circle at 35% 35%, #6EE7B7 0%, #34D399 30%, #10B981 70%, #059669 100%)',
                border: '6px solid rgba(255, 255, 255, 0.8)',
                boxShadow: `
                  0 0 60px rgba(16, 185, 129, 0.9),
                  0 20px 60px rgba(16, 185, 129, 0.6),
                  0 8px 16px rgba(0, 0, 0, 0.4),
                  inset 0 2px 12px rgba(255, 255, 255, 0.6),
                  inset 0 -2px 8px rgba(0, 0, 0, 0.2)
                `,
                pointerEvents: 'none',
                transform: 'translateZ(50px)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: 1,
                rotate: [0, 360],
              }}
              transition={{
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                opacity: {
                  duration: 0.4,
                  delay: 0.5,
                },
                rotate: {
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                },
              }}
            >
              {/* Inner highlight - glossy effect */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '60%',
                  height: '60%',
                  top: '10%',
                  left: '15%',
                  background: 'radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                  filter: 'blur(3px)',
                }}
              />
            </motion.div>

            {/* Orbiting sparkles */}
            {sparkles.map((sparkle, i) => {
              const angle = (i / sparkles.length) * 360;
              const radius = 90;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <motion.div
                  key={sparkle.id}
                  className="absolute rounded-full"
                  style={{
                    left: targetPosition.x + targetPosition.width / 2 - 4,
                    top: targetPosition.y + targetPosition.height / 2 - 4,
                    width: 8,
                    height: 8,
                    background: 'radial-gradient(circle, #FFF 0%, #FDE047 100%)',
                    boxShadow: '0 0 12px rgba(253, 224, 71, 0.9)',
                    pointerEvents: 'none',
                  }}
                  animate={{
                    x: [x, x * 1.2, x],
                    y: [y, y * 1.2, y],
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                />
              );
            })}

            {/* Concentric pulse rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`pulse-${i}`}
                className="absolute rounded-full border-4"
                style={{
                  left: targetPosition.x + targetPosition.width / 2 - 75,
                  top: targetPosition.y + targetPosition.height / 2 - 75,
                  width: 150,
                  height: 150,
                  borderColor: 'rgba(16, 185, 129, 0.6)',
                  pointerEvents: 'none',
                }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.6,
                }}
              />
            ))}

            {/* Make the actual target clickable */}
            <div
              className="absolute cursor-pointer"
              style={{
                left: targetPosition.x,
                top: targetPosition.y,
                width: targetPosition.width,
                height: targetPosition.height,
                pointerEvents: 'auto',
                zIndex: 10000,
              }}
              onClick={onDismiss}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
