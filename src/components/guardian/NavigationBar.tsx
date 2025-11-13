'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Video,
  Heart,
  Mic,
  Bell,
  Settings,
  User,
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { colors } from '@/styles/guardian-design-system';

interface SystemMetric {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

interface NavigationBarProps {
  userName?: string;
  userAvatar?: string;
  unreadNotifications?: number;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
}

/**
 * NavigationBar - Enterprise-grade top navigation with system metrics
 */
export const NavigationBar: React.FC<NavigationBarProps> = ({
  userName = 'Caregiver',
  userAvatar,
  unreadNotifications = 0,
  onProfileClick,
  onNotificationsClick,
  onSettingsClick,
}) => {
  const systemMetrics: SystemMetric[] = [
    {
      icon: <Video size={18} />,
      label: 'Visual',
      value: 'Active',
      color: colors.guardianCyan.base,
    },
    {
      icon: <Heart size={18} />,
      label: 'Vital Signs',
      value: 'Normal',
      color: colors.vitalGreen.base,
    },
    {
      icon: <Shield size={18} />,
      label: 'Protection',
      value: 'Enabled',
      color: colors.vitalGreen.base,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        zIndex: 100,
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
        borderBottom: `1px solid ${colors.guardianCyan.rgba(0.1)}`,
      }}
    >
      {/* Left Section - Logo & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield
            size={24}
            color={colors.guardianCyan.base}
            style={{
              filter: `drop-shadow(0 0 8px ${colors.guardianCyan.rgba(0.6)})`,
            }}
          />
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}
          >
            Senior Safeguard
          </span>
        </div>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 24 }}>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: colors.vitalGreen.base,
              boxShadow: `0 0 12px ${colors.vitalGreen.rgba(0.6)}`,
            }}
          />
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: colors.text.secondary.color,
            }}
          >
            All Systems Active
          </span>
        </div>
      </div>

      {/* Center Section - System Metrics */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {systemMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ color: metric.color }}>
              {metric.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: colors.text.tertiary.color,
                  opacity: colors.text.tertiary.opacity,
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: metric.color,
                }}
              >
                {metric.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right Section - Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNotificationsClick}
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: colors.text.secondary.color,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: colors.emergencyRed.base,
                border: '2px solid #0f1729',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </motion.div>
          )}
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          transition={{ duration: 0.3 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: colors.text.secondary.color,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label="Settings"
        >
          <Settings size={20} />
        </motion.button>

        {/* Profile Avatar */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onProfileClick}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: userAvatar ? `url(${userAvatar})` : 'rgba(255, 255, 255, 0.1)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: `2px solid ${colors.guardianCyan.base}`,
            boxShadow: `0 0 12px ${colors.guardianCyan.rgba(0.4)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: colors.guardianCyan.base,
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label={`Profile: ${userName}`}
        >
          {!userAvatar && <User size={20} />}
        </motion.button>
      </div>
    </div>
  );
};

export default NavigationBar;
