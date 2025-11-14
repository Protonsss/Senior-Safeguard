'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';

interface TrustBadgeProps {
  className?: string;
  delay?: number;
}

/**
 * TrustBadge - Privacy and security indicator
 *
 * Features:
 * - Pill-shaped badge with icons
 * - Subtle green tint (matches button)
 * - Shield + Lock icons
 * - Separator between items
 * - Fade-in entrance animation
 * - Helps build trust with seniors
 */
export default function TrustBadge({ className = '', delay = 0 }: TrustBadgeProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className={`inline-flex items-center gap-3 px-5 py-3 rounded-full ${className}`}
        style={{
          background: 'rgba(0,200,83,0.1)',
          border: '1px solid rgba(0,200,83,0.3)',
        }}
      >
        <Shield className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-700">Private & Secure</span>
        <div className="w-px h-4 bg-green-300" />
        <Lock className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">You have full control</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-full ${className}`}
      style={{
        background: 'rgba(0,200,83,0.1)',
        border: '1px solid rgba(0,200,83,0.3)',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {/* Shield icon */}
      <motion.div
        initial={{ rotate: -10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.1, type: 'spring', stiffness: 200 }}
      >
        <Shield className="w-5 h-5 text-green-600" />
      </motion.div>

      {/* Text 1 */}
      <motion.span
        className="text-sm font-medium text-green-700"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: delay + 0.2 }}
      >
        Private & Secure
      </motion.span>

      {/* Separator */}
      <div className="w-px h-4 bg-green-300" />

      {/* Lock icon */}
      <motion.div
        initial={{ rotate: 10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.3, type: 'spring', stiffness: 200 }}
      >
        <Lock className="w-4 h-4 text-green-600" />
      </motion.div>

      {/* Text 2 */}
      <motion.span
        className="text-sm font-medium text-green-700"
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: delay + 0.4 }}
      >
        You have full control
      </motion.span>
    </motion.div>
  );
}
