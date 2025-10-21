'use client';

import VoiceAssistant from '@/components/VoiceAssistant';
import Logo from '@/components/Logo';
import { Language } from '@/lib/i18n';

export default function SeniorPage() {
  // Default to English for UI labels, but API will auto-detect language from speech
  const language: Language = 'en';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header with glassmorphism */}
      <header className="frosted-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-center items-center">
          <Logo size="md" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Welcome Card */}
        <div className="glass-card mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome to Your AI Assistant
          </h2>
          <p className="text-white/90 text-base sm:text-lg">
            Speak naturally in any language. I'm here to help you stay safe and connected.
          </p>
        </div>

        {/* Voice Assistant Container */}
        <VoiceAssistant language={language} />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="glass-card text-center group hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="font-bold text-white mb-2">Multi-Language</h3>
            <p className="text-white/80 text-sm">Automatically detects your language</p>
          </div>
          <div className="glass-card text-center group hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-bold text-white mb-2">Scam Protection</h3>
            <p className="text-white/80 text-sm">Real-time fraud detection</p>
          </div>
          <div className="glass-card text-center group hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-white mb-2">Easy to Use</h3>
            <p className="text-white/80 text-sm">Just speak naturally</p>
          </div>
        </div>
      </main>

      {/* Footer with frosted glass */}
      <footer className="relative z-10 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-card text-center">
            <p className="text-white/80 mb-4">Need immediate assistance?</p>
            <a 
              href="tel:+14155550000"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              📞 Emergency Contact
            </a>
          </div>
        </div>
      </footer>

      {/* Bottom padding for mobile */}
      <div className="h-20 md:h-0" />
    </div>
  );
}

