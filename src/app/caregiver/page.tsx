'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardMetrics from '@/components/caregiver/DashboardMetrics';
import ActivityLog from '@/components/caregiver/ActivityLog';
import ScamAlerts from '@/components/caregiver/ScamAlerts';
import SeniorProfile from '@/components/caregiver/SeniorProfile';

export default function CaregiverPortal() {
  const router = useRouter();
  const [selectedSenior, setSelectedSenior] = useState<string | null>(null);
  const [seniors, setSeniors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSeniors();
  }, []);

  const loadSeniors = async () => {
    try {
      // Mock data - in production, fetch from API
      const mockSeniors = [
        {
          id: 'a1111111-1111-1111-1111-111111111111',
          name: 'John Smith',
          language: 'en',
          scamShieldActive: true,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: 'a2222222-2222-2222-2222-222222222222',
          name: 'Wang Meiling',
          language: 'zh',
          scamShieldActive: false,
          lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
      ];

      setSeniors(mockSeniors);
      if (mockSeniors.length > 0) {
        setSelectedSenior(mockSeniors[0].id);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading seniors:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const activeSenior = seniors.find(s => s.id === selectedSenior);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Caregiver Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Sarah Johnson</span>
              <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Senior List */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Your Seniors</h2>
              <div className="space-y-3">
                {seniors.map((senior) => (
                  <button
                    key={senior.id}
                    onClick={() => setSelectedSenior(senior.id)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selectedSenior === senior.id
                        ? 'bg-senior-trust text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold">{senior.name}</div>
                    <div className={`text-sm mt-1 ${
                      selectedSenior === senior.id ? 'text-white' : 'text-gray-500'
                    }`}>
                      {senior.language.toUpperCase()} • 
                      {senior.scamShieldActive ? ' 🛡️ Protected' : ' ⚠️ Not Protected'}
                    </div>
                  </button>
                ))}

                <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-senior-trust hover:text-senior-trust">
                  + Add Senior
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {activeSenior && (
              <>
                {/* Senior Profile Card */}
                <SeniorProfile senior={activeSenior} />

                {/* Dashboard Metrics */}
                <DashboardMetrics seniorId={activeSenior.id} />

                {/* Scam Alerts */}
                <ScamAlerts seniorId={activeSenior.id} />

                {/* Activity Log */}
                <ActivityLog seniorId={activeSenior.id} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

