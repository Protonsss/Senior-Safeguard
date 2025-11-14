'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { Eye, Sparkles, Check } from 'lucide-react';

type ButtonState = 'idle' | 'hover' | 'active' | 'loading' | 'success';

interface PremiumButtonProps {
  onClick: () => void;
  children?: ReactNode;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  icon?: 'eye' | 'sparkles' | 'custom';
  customIcon?: ReactNode;
  className?: string;
}

/**
 * PremiumButton - Enterprise-grade button with multiple interaction states
 *
 * Features:
 * - Green gradient background with overlay shine
 * - Multiple shadow layers creating depth
 * - Hover/active/loading/success states
 * - Shimmer animation on hover
 * - Haptic feedback (mobile)
 * - Smooth scale transitions
 * - Accessible with keyboard focus
 *
 * Designed to be irresistible to click
 */
export default function PremiumButton({
  onClick,
  children = 'Enable AI Vision',
  loading = false,
  success = false,
  disabled = false,
  icon = 'eye',
  customIcon,
  className = '',
}: PremiumButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  const handleClick = () => {
    if (disabled || loading) return;

    // Haptic feedback (mobile only)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Medium impact
    }

    setButtonState('active');
    onClick();

    setTimeout(() => setButtonState('idle'), 100);
  };

  const getIcon = () => {
    if (success) return <Check className="w-6 h-6" />;
    if (loading) return null;
    if (customIcon) return customIcon;

    switch (icon) {
      case 'eye':
        return <Eye className="w-6 h-6" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    if (success) return 'AI Vision Active';
    if (loading) return 'Connecting...';
    return children;
  };

  // Reduced motion version
  if (shouldReduceMotion) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`
          w-full h-[72px] rounded-2xl px-6 py-4
          bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-[22px]
          shadow-lg hover:shadow-xl
          disabled:opacity-80 disabled:cursor-not-allowed
          focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-2
          transition-all duration-200
          ${className}
        `}
      >
        <span className="flex items-center justify-center gap-3">
          {getIcon()}
          {getLabel()}
        </span>
      </button>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Button */}
      <motion.button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`
          relative w-full h-[72px] rounded-2xl px-6 overflow-hidden
          focus-visible:ring-4 focus-visible:ring-green-400 focus-visible:ring-offset-2
          disabled:cursor-not-allowed
          transition-shadow duration-300
        `}
        style={{
          background: success
            ? 'linear-gradient(135deg, #00C853 0%, #00E676 100%)'
            : 'linear-gradient(135deg, #00C853 0%, #00E676 100%)',
        }}
        initial={{ scale: 1 }}
        whileHover={!disabled && !loading ? { scale: 1.02, y: -3 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        animate={{
          boxShadow: buttonState === 'active'
            ? '0 6px 16px rgba(0,200,83,0.2)'
            : [
              '0 12px 32px rgba(0,200,83,0.4)',
              '0 16px 40px rgba(0,200,83,0.5)',
              '0 12px 32px rgba(0,200,83,0.4)',
            ],
        }}
        transition={{
          boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
        onHoverStart={() => !disabled && !loading && setButtonState('hover')}
        onHoverEnd={() => setButtonState('idle')}
      >
        {/* Inner shadow (top highlight) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
            borderRadius: '1rem',
          }}
        />

        {/* Border */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />

        {/* Shimmer effect */}
        {buttonState === 'hover' && !loading && !disabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        )}

        {/* Pulse animation (idle state) */}
        {buttonState === 'idle' && !loading && !disabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          />
        )}

        {/* Loading gradient flow */}
        {loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Content */}
        <span className="relative flex items-center justify-center gap-3 text-white font-semibold text-[22px] tracking-wide">
          {/* Icon */}
          <motion.span
            animate={loading ? { rotate: 360 } : {}}
            transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            {getIcon()}
          </motion.span>

          {/* Label */}
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: loading ? [1, 0.6, 1] : 1 }}
            transition={loading ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
          >
            {getLabel()}
          </motion.span>

          {/* Trailing icon */}
          {!loading && !success && icon === 'eye' && <Sparkles className="w-5 h-5" />}

          {/* Loading spinner */}
          {loading && (
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </span>

        {/* Success flash */}
        {success && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.button>
    </div>
  );
}
