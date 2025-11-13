'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Phone,
  MessageSquare,
  Settings,
  Shield,
  Activity,
  MapPin,
  Battery,
  Wifi,
  Clock,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { GlassCard } from '@/components/guardian/GlassCard';
import { NavigationBar } from '@/components/guardian/NavigationBar';
import { createBackgroundGradient, colors } from '@/styles/guardian-design-system';
import { createClient } from '@/lib/supabase/client';

interface Senior {
  id: string;
  full_name: string;
  phone_number: string;
  language: string;
  scam_shield_active: boolean;
  last_active: string;
  status: 'online' | 'offline' | 'alert';
  battery_level?: number;
  location?: string;
}

/**
 * Senior Management Interface
 * Enterprise system for managing multiple seniors
 */
export default function SeniorManagement() {
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSenior, setSelectedSenior] = useState<Senior | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'alert'>('all');
  const [showAddSenior, setShowAddSenior] = useState(false);

  const supabase = createClient();

  // Load seniors from Supabase
  useEffect(() => {
    loadSeniors();

    // Set up real-time subscription
    const channel = supabase
      .channel('seniors-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'seniors'
      }, () => {
        loadSeniors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSeniors = async () => {
    try {
      const { data, error } = await supabase
        .from('seniors')
        .select(`
          id,
          full_name,
          phone_number,
          language,
          scam_shield_active,
          last_active
        `)
        .order('last_active', { ascending: false });

      if (error) throw error;

      // Transform data and add mock status/battery for demo
      const transformedSeniors: Senior[] = (data || []).map((senior: any) => ({
        ...senior,
        status: Math.random() > 0.3 ? 'online' : 'offline',
        battery_level: Math.floor(Math.random() * 100),
        location: 'Home',
      }));

      setSeniors(transformedSeniors);
    } catch (error) {
      console.error('Error loading seniors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSeniors = seniors.filter(senior => {
    const matchesSearch = senior.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         senior.phone_number.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || senior.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCallSenior = async (senior: Senior) => {
    console.log('Calling senior:', senior.full_name);
    // TODO: Integrate with Twilio to initiate call
  };

  const handleSendSMS = async (senior: Senior) => {
    console.log('Sending SMS to:', senior.full_name);
    // TODO: Integrate with Twilio to send SMS
  };

  const handleToggleScamShield = async (senior: Senior) => {
    try {
      const { error } = await supabase
        .from('seniors')
        .update({ scam_shield_active: !senior.scam_shield_active })
        .eq('id', senior.id);

      if (error) throw error;
      await loadSeniors();
    } catch (error) {
      console.error('Error toggling scam shield:', error);
    }
  };

  const statusColors = {
    online: colors.vitalGreen.base,
    offline: '#64748b',
    alert: colors.attentionAmber.base,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: createBackgroundGradient(),
        position: 'relative',
      }}
    >
      <NavigationBar
        userName="Caregiver"
        unreadNotifications={3}
        onProfileClick={() => console.log('Profile')}
        onNotificationsClick={() => console.log('Notifications')}
        onSettingsClick={() => console.log('Settings')}
      />

      <div style={{ padding: '120px 40px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 600,
              color: '#ffffff',
              margin: 0,
              marginBottom: 8,
              letterSpacing: '-0.015em',
            }}
          >
            Senior Management
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: colors.text.secondary.color,
              opacity: colors.text.secondary.opacity,
              margin: 0,
            }}
          >
            Monitor and manage all seniors in your care
          </p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="search-bar" hover={false}>
          <div style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.text.tertiary.color,
                  opacity: 0.6,
                }}
              />
              <input
                type="text"
                placeholder="Search seniors by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 200ms',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = colors.guardianCyan.rgba(0.3);
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                padding: '12px 40px 12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: '1rem',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
              }}
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="alert">Alert</option>
            </select>

            {/* Add Senior Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddSenior(true)}
              style={{
                padding: '12px 24px',
                background: colors.guardianCyan.rgba(0.2),
                border: `1px solid ${colors.guardianCyan.rgba(0.4)}`,
                borderRadius: 12,
                color: colors.guardianCyan.base,
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={20} />
              Add Senior
            </motion.button>
          </div>
        </GlassCard>

        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 24 }}>
          {[
            { label: 'Total Seniors', value: seniors.length, color: colors.guardianCyan.base },
            { label: 'Online Now', value: seniors.filter(s => s.status === 'online').length, color: colors.vitalGreen.base },
            { label: 'Scam Shield Active', value: seniors.filter(s => s.scam_shield_active).length, color: colors.etherealPurple.base },
            { label: 'Need Attention', value: seniors.filter(s => s.status === 'alert').length, color: colors.attentionAmber.base },
          ].map((stat, index) => (
            <GlassCard key={stat.label} hover={false}>
              <div style={{ padding: 24 }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: colors.text.tertiary.color,
                    opacity: 0.7,
                    marginBottom: 8,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: 700,
                    color: stat.color,
                    fontFamily: '"JetBrains Mono", monospace',
                    textShadow: `0 0 20px ${stat.color}66`,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Seniors Grid */}
        <div style={{ marginTop: 32 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: colors.text.secondary.color }}>
              Loading seniors...
            </div>
          ) : filteredSeniors.length === 0 ? (
            <GlassCard hover={false}>
              <div style={{ padding: 60, textAlign: 'center' }}>
                <p style={{ fontSize: '1.125rem', color: colors.text.secondary.color, margin: 0 }}>
                  {searchQuery || filterStatus !== 'all' ? 'No seniors match your search criteria.' : 'No seniors added yet. Click "Add Senior" to get started.'}
                </p>
              </div>
            </GlassCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
              {filteredSeniors.map((senior) => (
                <GlassCard
                  key={senior.id}
                  hover={true}
                  glow={senior.status === 'alert' ? 'amber' : senior.scam_shield_active ? 'green' : 'cyan'}
                  onClick={() => setSelectedSenior(senior)}
                >
                  <div style={{ padding: 24 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            margin: 0,
                            marginBottom: 4,
                          }}
                        >
                          {senior.full_name}
                        </h3>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: colors.text.tertiary.color,
                            margin: 0,
                          }}
                        >
                          {senior.phone_number}
                        </p>
                      </div>

                      {/* Status Indicator */}
                      <div
                        style={{
                          padding: '6px 12px',
                          borderRadius: 12,
                          background: `${statusColors[senior.status]}22`,
                          border: `1px solid ${statusColors[senior.status]}44`,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: statusColors[senior.status],
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {senior.status}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Battery size={16} color={senior.battery_level! > 20 ? colors.vitalGreen.base : colors.emergencyRed.base} />
                        <span style={{ fontSize: '0.875rem', color: colors.text.secondary.color }}>
                          {senior.battery_level}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Shield size={16} color={senior.scam_shield_active ? colors.vitalGreen.base : colors.text.disabled.color} />
                        <span style={{ fontSize: '0.875rem', color: colors.text.secondary.color }}>
                          {senior.scam_shield_active ? 'Protected' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={16} color={colors.guardianCyan.base} />
                        <span style={{ fontSize: '0.875rem', color: colors.text.secondary.color }}>
                          {senior.location}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={16} color={colors.etherealPurple.base} />
                        <span style={{ fontSize: '0.875rem', color: colors.text.secondary.color }}>
                          {senior.last_active}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallSenior(senior);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: `${colors.vitalGreen.base}22`,
                          border: `1px solid ${colors.vitalGreen.base}44`,
                          borderRadius: 10,
                          color: colors.vitalGreen.base,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Phone size={16} />
                        Call
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendSMS(senior);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: `${colors.guardianCyan.base}22`,
                          border: `1px solid ${colors.guardianCyan.base}44`,
                          borderRadius: 10,
                          color: colors.guardianCyan.base,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <MessageSquare size={16} />
                        SMS
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleScamShield(senior);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: senior.scam_shield_active ? `${colors.attentionAmber.base}22` : `${colors.vitalGreen.base}22`,
                          border: senior.scam_shield_active ? `1px solid ${colors.attentionAmber.base}44` : `1px solid ${colors.vitalGreen.base}44`,
                          borderRadius: 10,
                          color: senior.scam_shield_active ? colors.attentionAmber.base : colors.vitalGreen.base,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <Shield size={16} />
                        {senior.scam_shield_active ? 'Disable' : 'Enable'}
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        select option {
          background: #0f1729;
          color: #ffffff;
        }

        input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
}
