'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { glassMaterial, animations } from '@/styles/guardian-design-system';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'cyan' | 'purple' | 'green' | 'amber' | 'red' | 'none';
  onClick?: () => void;
  ariaLabel?: string;
}

/**
 * GlassCard - Premium glassmorphism card component
 * "Frozen Glass" material with shimmer effects
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  glow = 'none',
  onClick,
  ariaLabel,
}) => {
  const glowColors = {
    cyan: '#00e5ff',
    purple: '#a78bfa',
    green: '#34d399',
    amber: '#fbbf24',
    red: '#ef4444',
    none: 'transparent',
  };

  const hoverAnimation = hover ? {
    y: -4,
    boxShadow: [
      'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      '0 12px 48px rgba(0, 0, 0, 0.5)',
      '0 4px 16px rgba(0, 0, 0, 0.3)',
      `0 0 20px 4px ${glowColors[glow]}33`,
    ].join(', '),
  } : {};

  return (
    <motion.div
      className={`glass-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverAnimation}
      transition={{
        duration: hover ? 0.4 : 0.6,
        ease: animations.easings.standard,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      style={{
        position: 'relative',
        background: glassMaterial.base.background,
        backgroundImage: glassMaterial.base.backgroundGradient,
        backdropFilter: glassMaterial.base.backdropFilter,
        WebkitBackdropFilter: glassMaterial.base.backdropFilter,
        border: glassMaterial.base.border,
        borderRadius: glassMaterial.base.borderRadius,
        boxShadow: glassMaterial.base.boxShadow,
        overflow: 'hidden',
      }}
    >
      {/* Shimmer overlay on hover */}
      {hover && (
        <motion.div
          className="shimmer-overlay"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: animations.easings.standard,
          }}
          style={{
            position: 'absolute',
            inset: 0,
            background: glassMaterial.shimmer.gradient,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Reflection layer (machined edge) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: glassMaterial.reflection.height,
          background: glassMaterial.reflection.gradient,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {children}
      </div>
    </motion.div>
  );
};

interface StatusCardProps {
  icon: ReactNode;
  title: string;
  timestamp?: string;
  primaryMetric: string;
  primaryValue: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  status: string;
  statusColor?: 'cyan' | 'purple' | 'green' | 'amber' | 'red';
  miniChart?: ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * StatusCard - Corner-positioned status cards with metrics
 */
export const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  title,
  timestamp,
  primaryMetric,
  primaryValue,
  unit,
  trend,
  status,
  statusColor = 'cyan',
  miniChart,
  actionButton,
  position,
}) => {
  const positionStyles = {
    'top-left': { top: 40, left: 40 },
    'top-right': { top: 40, right: 40 },
    'bottom-left': { bottom: 40, left: 40 },
    'bottom-right': { bottom: 40, right: 40 },
  };

  const colorMap = {
    cyan: '#00e5ff',
    purple: '#a78bfa',
    green: '#34d399',
    amber: '#fbbf24',
    red: '#ef4444',
  };

  const trendArrow = trend?.direction === 'up' ? '↗' : trend?.direction === 'down' ? '↘' : '→';
  const trendColor = trend?.direction === 'up' ? '#34d399' : trend?.direction === 'down' ? '#ef4444' : '#94a3b8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: position === 'top-left' ? 0 : position === 'top-right' ? 0.1 : position === 'bottom-left' ? 0.2 : 0.3,
        ease: animations.easings.decelerate,
      }}
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 10,
      }}
    >
      <GlassCard
        className="status-card"
        hover={true}
        glow={statusColor}
      >
        <div style={{ width: 280, padding: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 32, color: colorMap[statusColor], filter: `drop-shadow(0 0 12px ${colorMap[statusColor]}66)` }}>
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 500,
                color: '#ffffff',
                margin: 0,
                marginBottom: 4,
              }}>
                {title}
              </h3>
              {timestamp && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  opacity: 0.65,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.01em',
                }}>
                  {timestamp}
                </p>
              )}
            </div>
          </div>

          {/* Primary Metric */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#cbd5e1',
              marginBottom: 8,
            }}>
              {primaryMetric}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
            }}>
              <span style={{
                fontSize: '2.25rem',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: '"JetBrains Mono", monospace',
                fontFeatureSettings: '"tnum"',
                letterSpacing: '-0.02em',
              }}>
                {primaryValue}
              </span>
              {unit && (
                <span style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  opacity: 0.65,
                }}>
                  {unit}
                </span>
              )}
              {trend && (
                <span style={{
                  fontSize: '0.875rem',
                  color: trendColor,
                  marginLeft: 'auto',
                }}>
                  {trendArrow} {trend.value}
                </span>
              )}
            </div>
          </div>

          {/* Mini Chart */}
          {miniChart && (
            <div style={{ marginBottom: 16, height: 30 }}>
              {miniChart}
            </div>
          )}

          {/* Footer Status */}
          <div style={{
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <div style={{
              fontSize: '1rem',
              color: '#cbd5e1',
              opacity: 0.85,
              marginBottom: actionButton ? 12 : 0,
            }}>
              {status}
            </div>

            {actionButton && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={actionButton.onClick}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: `${colorMap[statusColor]}22`,
                  border: `1px solid ${colorMap[statusColor]}44`,
                  borderRadius: 12,
                  color: colorMap[statusColor],
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {actionButton.label}
              </motion.button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default GlassCard;
