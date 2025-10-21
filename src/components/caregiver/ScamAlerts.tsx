'use client';

import { useState, useEffect } from 'react';

interface ScamAlert {
  id: string;
  phoneNumber: string;
  callerName?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  scamType?: string;
  blocked: boolean;
  timestamp: Date;
}

interface ScamAlertsProps {
  seniorId: string;
}

export default function ScamAlerts({ seniorId }: ScamAlertsProps) {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'unblocked'>('all');

  useEffect(() => {
    loadAlerts();
  }, [seniorId]);

  const loadAlerts = async () => {
    // Mock data - in production, fetch from API
    const mockAlerts: ScamAlert[] = [
      {
        id: '1',
        phoneNumber: '+18005551111',
        callerName: 'IRS Scam',
        riskLevel: 'critical',
        scamType: 'fraud',
        blocked: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        phoneNumber: '+18005552222',
        callerName: 'Unknown',
        riskLevel: 'high',
        scamType: 'spam',
        blocked: true,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        id: '3',
        phoneNumber: '+14155556789',
        riskLevel: 'low',
        blocked: false,
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
    ];

    setAlerts(mockAlerts);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'blocked') return alert.blocked;
    if (filter === 'unblocked') return !alert.blocked;
    return true;
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Scam Alerts</h2>
        <div className="flex space-x-2">
          {(['all', 'blocked', 'unblocked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-senior-trust text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">🛡️</div>
          <p className="text-lg">No scam alerts in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-2 rounded-lg p-4 ${getRiskColor(alert.riskLevel)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">
                      {alert.blocked ? '🛡️' : '⚠️'}
                    </span>
                    <div>
                      <div className="font-bold text-lg">
                        {alert.callerName || 'Unknown Caller'}
                      </div>
                      <div className="text-sm opacity-80">
                        {alert.phoneNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="font-semibold uppercase">
                      {alert.riskLevel} Risk
                    </span>
                    {alert.scamType && (
                      <span className="capitalize">• {alert.scamType}</span>
                    )}
                    <span>
                      • {alert.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  {alert.blocked ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Blocked
                    </span>
                  ) : (
                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                      Block Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

