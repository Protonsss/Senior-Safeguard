'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingText3DProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'p';
  size?: 'display' | 'h1' | 'h2' | 'body';
  className?: string;
  delay?: number;
}

/**
 * FloatingText3D - High-contrast text with 3D depth effects
 *
 * Features:
 * - Multiple shadow layers creating 3D depth
 * - Subtle gradient for dimension
 * - Frosted glass background
 * - Gentle floating animation
 * - Slide-up entrance animation
 * - WCAG AAA contrast (21:1 for black on white)
 *
 * Typography scales:
 * - display: 64px (rare, only for empty states)
 * - h1: 42px (main message)
 * - h2: 32px (section)
 * - body: 20px (everything else)
 */
export default function FloatingText3D({
  children,
  as = 'h1',
  size = 'h1',
  className = '',
  delay = 0,
}: FloatingText3DProps) {
  const shouldReduceMotion = useReducedMotion();

  const sizeStyles = {
    display: {
      fontSize: '4rem', // 64px
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h1: {
      fontSize: '2.625rem', // 42px
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem', // 32px
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },
    body: {
      fontSize: '1.25rem', // 20px
      fontWeight: 400,
      letterSpacing: '0em',
      lineHeight: 1.6,
    },
  }[size];

  const textShadow = `
    0 1px 0 rgba(255,255,255,0.4),
    0 2px 4px rgba(0,0,0,0.1),
    0 8px 16px rgba(0,0,0,0.08),
    0 16px 32px rgba(0,0,0,0.05)
  `;

  const Component = as;

  if (shouldReduceMotion) {
    return (
      <Component
        className={className}
        style={{
          ...sizeStyles,
          color: '#000000',
          textShadow,
        }}
      >
        {children}
      </Component>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="relative"
    >
      {/* Frosted glass background (for body text) */}
      {size === 'body' && (
        <motion.div
          className="absolute -inset-4 rounded-3xl pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
        />
      )}

      {/* Text with 3D shadows */}
      <Component
        className={`relative ${className}`}
        style={{
          ...sizeStyles,
          background: 'linear-gradient(180deg, #000000 0%, #1A1A1A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow,
          filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.4))',
        }}
      >
        {/* Fallback text color for non-webkit browsers */}
        <span className="sr-only">{children}</span>
        <span aria-hidden="true">{children}</span>
      </Component>

      {/* Gentle float animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
