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

  // Real-time metrics from Supabase
  const [activeSeniors, setActiveSeniors] = useState(0);
  const [scamsBlocked, setScamsBlocked] = useState(0);
  const [pendingAlerts, setPendingAlerts] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load real data from Supabase
  useEffect(() => {
    loadDashboardMetrics();
    const interval = setInterval(loadDashboardMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardMetrics() {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // Get active seniors count
      const { count: seniorsCount } = await supabase
        .from('seniors')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get scams blocked today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: scamsCount, data: scamsData } = await supabase
        .from('scam_attempts')
        .select('estimated_loss_prevented', { count: 'exact' })
        .eq('was_blocked', true)
        .gte('detected_at', today.toISOString());

      // Get pending alerts
      const { count: alertsCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate total saved
      const saved = scamsData?.reduce((sum, attempt) => sum + (attempt.estimated_loss_prevented || 0), 0) || 0;

      setActiveSeniors(seniorsCount || 0);
      setScamsBlocked(scamsCount || 0);
      setPendingAlerts(alertsCount || 0);
      setTotalSaved(saved);

      // Update orb state based on alerts
      if (alertsCount && alertsCount > 5) {
        setOrbState('alert');
      } else if (alertsCount && alertsCount > 0) {
        setOrbState('listening');
      } else {
        setOrbState('idle');
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setLoading(false);
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        icon={<TrendingUp size={32} />}
        title="Active Seniors"
        timestamp="Live"
        primaryMetric="Currently Monitored"
        primaryValue={loading ? '...' : activeSeniors}
        unit="seniors"
        trend={{
          direction: 'neutral',
          value: 'Real-time monitoring',
        }}
        status={activeSeniors > 0 ? 'System Active' : 'Awaiting Data'}
        statusColor="cyan"
        actionButton={{
          label: 'View All Seniors',
          onClick: () => window.location.href = '/guardian/seniors',
        }}
      />

      <StatusCard
        position="top-right"
        icon={<AlertTriangle size={32} />}
        title="Alert Status"
        timestamp="Live"
        primaryMetric="Pending Alerts"
        primaryValue={loading ? '...' : pendingAlerts}
        unit="alerts"
        trend={{
          direction: pendingAlerts > 0 ? 'up' : 'down',
          value: pendingAlerts > 0 ? 'Needs attention' : 'All clear',
        }}
        status={pendingAlerts > 0 ? 'Action Required' : 'No Active Alerts'}
        statusColor={pendingAlerts > 5 ? 'red' : pendingAlerts > 0 ? 'amber' : 'green'}
        actionButton={{
          label: 'View Alerts',
          onClick: () => window.location.href = '/guardian/seniors',
        }}
      />

      <StatusCard
        position="bottom-left"
        icon={<Shield size={32} />}
        title="Scam Protection"
        timestamp="Today"
        primaryMetric="Scams Blocked"
        primaryValue={loading ? '...' : scamsBlocked}
        unit="attempts"
        trend={{
          direction: 'up',
          value: formatCurrency(totalSaved) + ' saved',
        }}
        status={scamsBlocked > 0 ? 'Actively Protecting' : 'Monitoring'}
        statusColor="green"
        actionButton={{
          label: 'View Details',
          onClick: () => loadDashboardMetrics(), // Refresh data
        }}
      />

      <StatusCard
        position="bottom-right"
        icon={<Clock size={32} />}
        title="Financial Impact"
        timestamp="Today"
        primaryMetric="Fraud Prevented"
        primaryValue={loading ? '...' : formatCurrency(totalSaved)}
        unit=""
        trend={{
          direction: totalSaved > 0 ? 'up' : 'neutral',
          value: `${scamsBlocked} threats blocked`,
        }}
        status={totalSaved > 0 ? 'ROI Positive' : 'Monitoring'}
        statusColor="purple"
        actionButton={{
          label: 'Refresh Data',
          onClick: () => loadDashboardMetrics(),
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
