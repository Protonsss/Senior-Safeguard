'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated gradient orbs in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Senior Safeguard
          </h1>
          <p className="text-2xl md:text-3xl text-cyan-200 font-light">
            AI-Powered Protection & Assistance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Senior Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={() => router.push('/senior')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 p-12 hover:scale-105 transition-all duration-300 hover:border-cyan-400/60"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="text-6xl mb-6">🗣️</div>
              <h2 className="text-3xl font-bold text-white mb-4">I Need Help</h2>
              <p className="text-lg text-cyan-100/80">
                Voice assistant ready to help you with anything
              </p>
            </div>

            <div className="absolute bottom-4 right-4 text-cyan-400/40 group-hover:text-cyan-400/80 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>

          {/* Caregiver Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onClick={() => router.push('/guardian')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 p-12 hover:scale-105 transition-all duration-300 hover:border-purple-400/60"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="text-6xl mb-6">👨‍⚕️</div>
              <h2 className="text-3xl font-bold text-white mb-4">Caregiver</h2>
              <p className="text-lg text-purple-100/80">
                Monitor and protect your loved ones
              </p>
            </div>

            <div className="absolute bottom-4 right-4 text-purple-400/40 group-hover:text-purple-400/80 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        </div>

        {/* Quick access link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-white/60 text-sm mb-4">Senior living facility staff?</p>
          <button
            onClick={() => router.push('/guardian/seniors')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
          >
            Go to Senior Management Portal →
          </button>
        </motion.div>
      </div>
    </div>
  );
}

