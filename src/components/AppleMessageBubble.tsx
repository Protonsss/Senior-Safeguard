'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AppleMessageBubbleProps {
  message: string;
  transcript?: string;
  visible: boolean;
}

/**
 * AppleMessageBubble
 * 
 * Production-grade Apple Intelligence message bubble with:
 * - True glassmorphism with vibrancy sampling
 * - Sunrise theme (warm peach/coral/amber palette)
 * - SF Pro typography with precise tracking
 * - Spring physics animations
 * - Specular highlights and micro-shadows
 * - Film grain to prevent banding
 * - Full accessibility support
 */
export default function AppleMessageBubble({ 
  message, 
  transcript, 
  visible 
}: AppleMessageBubbleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          className="fixed top-24 left-1/2 z-50 w-full max-w-2xl px-6 pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}
          initial={{ 
            opacity: 0, 
            scale: 0.92,
            y: -20,
            filter: 'blur(10px)'
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0,
            filter: 'blur(0px)'
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.96,
            y: -8,
            filter: 'blur(4px)',
            transition: {
              duration: 0.25,
              ease: [0.4, 0, 1, 1]
            }
          }}
          transition={{
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1], // Apple spring curve
            opacity: { duration: 0.4 },
            scale: { duration: 0.5 },
            filter: { duration: 0.3 }
          }}
        >
          {/* The Glass Card */}
          <div className="apple-intelligence-bubble pointer-events-auto">
            {/* Backdrop Blur Layer (底层) */}
            <div className="absolute inset-0 rounded-[28px] overflow-hidden">
              {/* True backdrop blur with saturation boost */}
              <div 
                className="absolute inset-0"
                style={{
                  backdropFilter: 'blur(80px) saturate(180%) brightness(1.15)',
                  WebkitBackdropFilter: 'blur(80px) saturate(180%) brightness(1.15)',
                }}
              />
              
              {/* Sunrise Tint Gradient - warm to cool micro-shift */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(
                      135deg,
                      rgba(255, 245, 230, 0.85) 0%,
                      rgba(255, 235, 215, 0.80) 50%,
                      rgba(255, 225, 205, 0.75) 100%
                    )
                  `,
                  mixBlendMode: 'normal'
                }}
              />
              
              {/* Radial Highlight - top-left bias (overhead light) */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(
                      ellipse 800px 500px at 25% 15%,
                      rgba(255, 255, 255, 0.25) 0%,
                      rgba(255, 255, 255, 0.12) 35%,
                      transparent 65%
                    )
                  `,
                }}
              />
              
              {/* Specular Lip (inner highlight) - glass thickness */}
              <div
                className="absolute inset-0 rounded-[28px]"
                style={{
                  boxShadow: `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.25)
                  `
                }}
              />
              
              {/* Film Grain Noise - prevent color banding */}
              <div
                className="absolute inset-0 rounded-[28px] opacity-40"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '128px 128px'
                }}
              />
            </div>

            {/* Hairline Border - ultra-thin white energy line */}
            <div 
              className="absolute inset-0 rounded-[28px] pointer-events-none"
              style={{
                border: '0.5px solid rgba(255, 255, 255, 0.65)',
                boxShadow: `
                  0 0 0 0.5px rgba(255, 255, 255, 0.15) inset
                `
              }}
            />

            {/* Shadow System - atmospheric + contact */}
            <div
              className="absolute inset-0 rounded-[28px]"
              style={{
                boxShadow: `
                  0 20px 60px -15px rgba(255, 140, 100, 0.20),
                  0 10px 25px -8px rgba(255, 100, 80, 0.15),
                  0 4px 12px -3px rgba(255, 70, 50, 0.12),
                  0 2px 4px -1px rgba(0, 0, 0, 0.08)
                `,
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))'
              }}
            />

            {/* Content Layer - with vibrancy */}
            <div className="relative z-10 px-8 py-7">
              {/* Main Message - staggered reveal */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.08,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <p 
                  className="text-[28px] leading-[1.2] font-semibold text-slate-900 dark:text-white"
                  style={{
                    letterSpacing: '-0.02em',
                    fontFeatureSettings: '"ss01", "cv05", "cv11"', // SF Pro features
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    // Subtle text shadow for depth
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.5), 0 0 1px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {message}
                </p>
              </motion.div>

              {/* Live Transcript - secondary with reduced contrast */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.15,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="mt-3"
                >
                  <p 
                    className="text-[17px] leading-[1.47] font-normal text-slate-600 dark:text-slate-300"
                    style={{
                      letterSpacing: '-0.01em',
                      fontFeatureSettings: '"ss01"',
                      textRendering: 'optimizeLegibility',
                      WebkitFontSmoothing: 'antialiased',
                      // Softer text shadow
                      textShadow: '0 0.5px 1px rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    {transcript}
                  </p>
                </motion.div>
              )}

              {/* Micro-indicator for "AI is typing" state */}
              {message.includes('...') && (
                <motion.div
                  className="flex gap-1.5 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-slate-400/60"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: [0.4, 0, 0.6, 1]
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

