'use client';

import React, { useState, useEffect } from 'react';
import { GuardianOrb } from '@/components/guardian/GuardianOrb';
import { NavigationBar } from '@/components/guardian/NavigationBar';
import { StatusCard } from '@/components/guardian/GlassCard';
import {
  Video,
  Heart,
  Mic,
  Shield,
  TrendingUp,
  Clock,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import { GuardianState } from '@/styles/guardian-design-system';
import { createBackgroundGradient, getResponsiveOrbSize, getParticleCount } from '@/styles/guardian-design-system';

/**
 * Guardian Dashboard - Enterprise AI Monitoring System
 * The command center for caregiver monitoring and control
 */
export default function GuardianDashboard() {
  // Guardian Orb State Management
  const [orbState, setOrbState] = useState<GuardianState>('idle');
  const [orbSize, setOrbSize] = useState(600);
  const [particleCount, setParticleCount] = useState(300);

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setOrbSize(getResponsiveOrbSize(width));
      setParticleCount(getParticleCount(width));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Demo: Cycle through states every 8 seconds
  useEffect(() => {
    const states: GuardianState[] = ['idle', 'listening', 'thinking', 'responding', 'idle'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % states.length;
      setOrbState(states[currentIndex]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Mock data - will be replaced with real Supabase data
  const cameraData = {
    roomsMonitored: 3,
    detectionConfidence: 98,
    lastMotion: '2 min ago',
    status: 'All cameras active',
  };

  const vitalData = {
    heartRate: 72,
    activityLevel: 'Moderate',
    sleepQuality: 85,
    status: 'Within normal range',
  };

  const voiceData = {
    commandsToday: 24,
    accuracy: 96,
    language: 'English',
    lastCommand: 'Call Sarah',
    status: 'Ready to help',
  };

  const safetyData = {
    scamsBlocked: 12,
    fallDetection: 'Active',
    emergencyContacts: 3,
    lastEvent: '1 hour ago',
    status: 'Protected',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: createBackgroundGradient(),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Atmospheric Layers */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Star Field */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1px 1px at 60% 70%, white, transparent),
            radial-gradient(2px 2px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(1px 1px at 90% 60%, white, transparent)
          `,
          backgroundSize: '200% 200%',
          opacity: 0.1,
          pointerEvents: 'none',
          animation: 'twinkle 4s ease-in-out infinite',
        }}
      />

      {/* Navigation Bar */}
      <NavigationBar
        userName="Caregiver"
        unreadNotifications={2}
        onProfileClick={() => console.log('Profile clicked')}
        onNotificationsClick={() => console.log('Notifications clicked')}
        onSettingsClick={() => console.log('Settings clicked')}
      />

      {/* Main Content - Guardian Orb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '100px 20px 80px',
        }}
      >
        <GuardianOrb
          state={orbState}
          size={orbSize}
          particleCount={particleCount}
          showControls={false}
        />
      </div>

      {/* Status Cards - Four Corners */}
      <StatusCard
        position="top-left"
        icon={<Video size={32} />}
        title="Camera Monitoring"
        timestamp="Updated 1m ago"
        primaryMetric="Rooms Monitored"
        primaryValue={cameraData.roomsMonitored}
        unit="rooms"
        trend={{
          direction: 'neutral',
          value: `${cameraData.detectionConfidence}% confidence`,
        }}
        status={cameraData.status}
        statusColor="cyan"
        actionButton={{
          label: 'View Cameras',
          onClick: () => console.log('View cameras'),
        }}
      />

      <StatusCard
        position="top-right"
        icon={<Heart size={32} />}
        title="Vital Signs"
        timestamp="Updated 30s ago"
        primaryMetric="Heart Rate"
        primaryValue={vitalData.heartRate}
        unit="BPM"
        trend={{
          direction: 'up',
          value: '2 BPM',
        }}
        status={vitalData.status}
        statusColor="green"
        actionButton={{
          label: 'View Health Data',
          onClick: () => console.log('View health'),
        }}
      />

      <StatusCard
        position="bottom-left"
        icon={<Mic size={32} />}
        title="Voice Assistant"
        timestamp="Updated 5m ago"
        primaryMetric="Commands Today"
        primaryValue={voiceData.commandsToday}
        unit="commands"
        trend={{
          direction: 'up',
          value: `${voiceData.accuracy}% accuracy`,
        }}
        status={voiceData.status}
        statusColor="purple"
        actionButton={{
          label: 'View History',
          onClick: () => console.log('View voice history'),
        }}
      />

      <StatusCard
        position="bottom-right"
        icon={<Shield size={32} />}
        title="Safety Shield"
        timestamp="Updated 1m ago"
        primaryMetric="Scams Blocked Today"
        primaryValue={safetyData.scamsBlocked}
        unit="attempts"
        trend={{
          direction: 'down',
          value: '3 less than yesterday',
        }}
        status={safetyData.status}
        statusColor="green"
        actionButton={{
          label: 'View Threats',
          onClick: () => console.log('View threats'),
        }}
      />

      {/* Emergency Controls - Bottom Center */}
      <div
        style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 16,
          zIndex: 50,
        }}
      >
        <button
          onClick={() => setOrbState('alert')}
          style={{
            padding: '12px 24px',
            background: 'rgba(251, 191, 36, 0.2)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            borderRadius: 16,
            color: '#fbbf24',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <AlertTriangle size={16} style={{ display: 'inline', marginRight: 8 }} />
          Test Alert
        </button>

        <button
          onClick={() => setOrbState('critical')}
          style={{
            padding: '12px 24px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 16,
            color: '#ef4444',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Phone size={16} style={{ display: 'inline', marginRight: 8 }} />
          Test Emergency
        </button>

        <button
          onClick={() => setOrbState('idle')}
          style={{
            padding: '12px 24px',
            background: 'rgba(0, 229, 255, 0.2)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            borderRadius: 16,
            color: '#00e5ff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Reset to Idle
        </button>
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        button:active {
          transform: translateY(0);
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}
