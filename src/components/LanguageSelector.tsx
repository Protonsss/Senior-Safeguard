'use client';

import { Language, getLanguageName } from '@/lib/i18n';

interface LanguageSelectorProps {
  onSelect: (language: Language) => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const languages: Array<{ code: Language; name: string; flag: string }> = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-senior-calm to-white">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-senior-trust rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
              🌍
            </div>
          </div>
          <h1 className="text-senior-2xl font-bold text-senior-trust mb-4">
            Choose Your Language
          </h1>
          <p className="text-senior-lg text-gray-700">
            Select the language you&apos;re most comfortable with
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className="card-senior hover:shadow-2xl hover:scale-105 transition-transform text-center cursor-pointer"
            >
              <div className="text-6xl mb-4">{lang.flag}</div>
              <div className="text-senior-xl font-bold text-senior-trust">
                {lang.name}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 text-senior-base">
            Don&apos;t worry, you can change this anytime
          </p>
        </div>
      </div>
    </div>
  );
}

