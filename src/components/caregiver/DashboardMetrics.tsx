'use client';

import { useState, useEffect } from 'react';

interface DashboardMetricsProps {
  seniorId: string;
}

export default function DashboardMetrics({ seniorId }: DashboardMetricsProps) {
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    totalSMS: 0,
    totalWebSessions: 0,
    tasksCompleted: 0,
    scamCallsBlocked: 0,
    avgSessionDuration: 0,
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadMetrics();
  }, [seniorId, timeRange]);

  const loadMetrics = async () => {
    // Mock data - in production, fetch from API
    const mockMetrics = {
      totalCalls: 12,
      totalSMS: 8,
      totalWebSessions: 5,
      tasksCompleted: 15,
      scamCallsBlocked: 3,
      avgSessionDuration: 4.5,
    };

    setMetrics(mockMetrics);
  };

  const metricCards = [
    {
      label: 'Phone Calls',
      value: metrics.totalCalls,
      icon: '📞',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'SMS Messages',
      value: metrics.totalSMS,
      icon: '💬',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Web Sessions',
      value: metrics.totalWebSessions,
      icon: '💻',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Tasks Completed',
      value: metrics.tasksCompleted,
      icon: '✅',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Scams Blocked',
      value: metrics.scamCallsBlocked,
      icon: '🛡️',
      color: 'bg-red-50 text-red-700',
    },
    {
      label: 'Avg. Session (min)',
      value: metrics.avgSessionDuration,
      icon: '⏱️',
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Activity Metrics</h2>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-senior-trust text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} rounded-lg p-6 transition-transform hover:scale-105`}
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold mb-1">{card.value}</div>
            <div className="text-sm font-medium opacity-80">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

