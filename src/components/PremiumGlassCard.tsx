'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumGlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * PremiumGlassCard - Frosted glass container with depth
 *
 * Features:
 * - Backdrop blur (frosted glass effect)
 * - Semi-transparent white background
 * - Subtle border highlight
 * - Multiple shadow layers
 * - Slide-up entrance animation
 * - Radial gradient glow effect
 */
export default function PremiumGlassCard({
  children,
  className = '',
  delay = 0,
}: PremiumGlassCardProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl ${className}`}
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl ${className}`}
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {/* Animated radial gradient glow */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.3), transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
