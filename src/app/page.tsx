'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    // For now, redirect to senior interface
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated gradient orbs in background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>
        <div className="spinner relative z-10"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated gradient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-3xl w-full space-y-8 text-center relative z-10">
        {/* Logo with Animation */}
        <div className="flex justify-center animate-fadeIn">
          <Logo size="lg" />
        </div>

        {/* Hero Text */}
        <div className="glass-card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your AI-Powered Care Companion
          </h2>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Speak naturally in any language. We protect you from scams, help with tech, and keep you connected.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => router.push('/senior')}
            className="w-full px-8 py-6 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-3xl">🗣️</span>
            Start Voice Assistant
          </button>

          <button
            onClick={() => router.push('/caregiver')}
            className="w-full glass-card py-5 text-white text-lg font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">👨‍⚕️</span>
            Caregiver Dashboard
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 pt-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card text-center group hover:scale-105 transition-transform">
            <div className="text-5xl mb-3">🗣️</div>
            <div className="text-white font-semibold text-base">Voice Powered</div>
            <p className="text-white/70 text-sm mt-1">Just speak naturally</p>
          </div>
          <div className="glass-card text-center group hover:scale-105 transition-transform">
            <div className="text-5xl mb-3">🌍</div>
            <div className="text-white font-semibold text-base">Multi-Language</div>
            <p className="text-white/70 text-sm mt-1">Auto-detects language</p>
          </div>
          <div className="glass-card text-center group hover:scale-105 transition-transform">
            <div className="text-5xl mb-3">🛡️</div>
            <div className="text-white font-semibold text-base">Scam Shield</div>
            <p className="text-white/70 text-sm mt-1">Real-time protection</p>
          </div>
          <div className="glass-card text-center group hover:scale-105 transition-transform">
            <div className="text-5xl mb-3">🤖</div>
            <div className="text-white font-semibold text-base">AI Assistant</div>
            <p className="text-white/70 text-sm mt-1">Always learning</p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-8 glass-card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <p className="text-white/90 text-base mb-3">Need immediate help? Call anytime:</p>
          <a 
            href="tel:+14155550000" 
            className="inline-flex items-center gap-2 text-2xl font-bold text-white hover:scale-110 transition-transform"
          >
            📞 (415) 555-0000
          </a>
        </div>
      </div>
    </div>
  );
}

