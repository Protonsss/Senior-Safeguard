'use client';

import { motion } from 'framer-motion';
import { Eye, Sparkles } from 'lucide-react';

interface ScreenVisionBadgeProps {
  isActive: boolean;
  isAnalyzing?: boolean;
}

/**
 * ScreenVisionBadge
 * Premium animated badge showing AI vision is active
 */
export default function ScreenVisionBadge({ isActive, isAnalyzing = false }: ScreenVisionBadgeProps) {
  if (!isActive) return null;

  return (
    <motion.div
      className="fixed top-24 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="relative">
        {/* Glow background */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.4), rgba(16, 185, 129, 0.2), transparent)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Main badge */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-emerald-400/90 to-teal-500/90 rounded-2xl px-4 py-3 shadow-2xl border border-white/30">
          <div className="flex items-center gap-3">
            {/* Animated eye icon */}
            <motion.div
              className="relative"
              animate={{
                scale: isAnalyzing ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isAnalyzing ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              <Eye className="w-6 h-6 text-white drop-shadow-lg" />
              
              {/* Scan line effect when analyzing */}
              {isAnalyzing && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-transparent"
                  initial={{ y: -20 }}
                  animate={{ y: 20 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ height: '2px' }}
                />
              )}
            </motion.div>

            {/* Text */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white drop-shadow-md">
                  AI Vision Active
                </span>
                {isAnalyzing && (
                  <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                )}
              </div>
              <span className="text-xs text-emerald-50 font-medium">
                {isAnalyzing ? 'Analyzing screen...' : 'Monitoring'}
              </span>
            </div>

            {/* Pulse indicator */}
            <motion.div
              className="w-2 h-2 rounded-full bg-white"
              animate={{
                opacity: [1, 0.3, 1],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>

        {/* Orbiting particles */}
        {isAnalyzing && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-emerald-300"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, 30, 0, -30, 0],
                  y: [0, -30, 0, 30, 0],
                  opacity: [0, 1, 1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}

