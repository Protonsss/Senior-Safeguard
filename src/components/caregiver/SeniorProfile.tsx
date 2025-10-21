'use client';

interface SeniorProfileProps {
  senior: {
    id: string;
    name: string;
    language: string;
    scamShieldActive: boolean;
    lastActive: Date;
  };
}

export default function SeniorProfile({ senior }: SeniorProfileProps) {
  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      en: 'English',
      zh: '中文 (Chinese)',
      hi: 'हिंदी (Hindi)',
      ta: 'தமிழ் (Tamil)',
    };
    return names[code] || code.toUpperCase();
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="bg-gradient-to-r from-senior-trust to-senior-safe rounded-xl shadow-md p-8 text-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">{senior.name}</h2>
          <div className="space-y-2 text-lg">
            <div className="flex items-center space-x-2">
              <span>🌍</span>
              <span>Language: {getLanguageName(senior.language)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⏰</span>
              <span>Last Active: {getTimeAgo(senior.lastActive)}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
            senior.scamShieldActive
              ? 'bg-green-500 bg-opacity-30'
              : 'bg-red-500 bg-opacity-30'
          }`}>
            <span className="text-2xl">{senior.scamShieldActive ? '🛡️' : '⚠️'}</span>
            <div>
              <div className="font-bold">Scam Shield</div>
              <div className="text-sm">
                {senior.scamShieldActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {!senior.scamShieldActive && (
            <button className="mt-4 px-6 py-3 bg-white text-senior-trust rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Activate Now
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white border-opacity-30">
        <button className="flex flex-col items-center space-y-2 p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
          <span className="text-3xl">📞</span>
          <span className="text-sm font-medium">Call Now</span>
        </button>
        <button className="flex flex-col items-center space-y-2 p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
          <span className="text-3xl">💬</span>
          <span className="text-sm font-medium">Send SMS</span>
        </button>
        <button className="flex flex-col items-center space-y-2 p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
          <span className="text-3xl">⚙️</span>
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}

