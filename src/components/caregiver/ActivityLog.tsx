'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: 'call' | 'sms' | 'web' | 'task';
  description: string;
  timestamp: Date;
  status?: 'success' | 'failed' | 'in_progress';
  details?: string;
}

interface ActivityLogProps {
  seniorId: string;
}

export default function ActivityLog({ seniorId }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    loadActivities();
  }, [seniorId]);

  const loadActivities = async () => {
    // Mock data - in production, fetch from API
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'task',
        description: 'Completed: Join Zoom Meeting',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success',
        details: 'Successfully joined meeting ID: 123-456-7890',
      },
      {
        id: '2',
        type: 'call',
        description: 'Phone call session',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'success',
        details: 'Duration: 5 minutes. Language: English',
      },
      {
        id: '3',
        type: 'sms',
        description: 'SMS: Check scam number',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'success',
        details: 'Checked number +18005551111 - Identified as scam',
      },
      {
        id: '4',
        type: 'web',
        description: 'Web session',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'success',
        details: 'Duration: 10 minutes. Asked 3 questions',
      },
      {
        id: '5',
        type: 'task',
        description: 'Failed: Connect to WiFi',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'failed',
        details: 'Could not connect to network "HomeNetwork"',
      },
    ];

    setActivities(mockActivities);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'sms':
        return '💬';
      case 'web':
        return '💻';
      case 'task':
        return '✅';
      default:
        return '📝';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'in_progress':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Activity Log</h2>
        <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">
          Export CSV
        </button>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedActivity(activity)}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">
                  {activity.description}
                </div>
                <div className="text-sm text-gray-600">
                  {activity.timestamp.toLocaleString()}
                </div>
                {activity.details && (
                  <div className="text-sm text-gray-500 mt-2">
                    {activity.details}
                  </div>
                )}
              </div>
              {activity.status && (
                <div className={`text-sm font-medium ${getStatusColor(activity.status)} capitalize`}>
                  {activity.status}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg">No activity recorded yet</p>
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold">Activity Details</h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-600">Type:</span>
                <div className="text-lg font-semibold capitalize">
                  {getActivityIcon(selectedActivity.type)} {selectedActivity.type}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Description:</span>
                <div className="text-lg">{selectedActivity.description}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Timestamp:</span>
                <div className="text-lg">
                  {selectedActivity.timestamp.toLocaleString()}
                </div>
              </div>
              {selectedActivity.status && (
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className={`text-lg font-semibold capitalize ${getStatusColor(selectedActivity.status)}`}>
                    {selectedActivity.status}
                  </div>
                </div>
              )}
              {selectedActivity.details && (
                <div>
                  <span className="text-sm text-gray-600">Details:</span>
                  <div className="text-lg">{selectedActivity.details}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

