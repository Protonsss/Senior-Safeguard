'use client';

import { motion } from 'framer-motion';
import { Captions, CaptionsOff, X } from 'lucide-react';
import VoiceOrb from './VoiceOrb';

type OrbState = 'idle' | 'listening' | 'thinking' | 'muted' | 'error';

interface BottomDockProps {
  state: OrbState;
  level: number;
  captionsOn: boolean;
  onToggleCaptions: () => void;
  onEnd: () => void;
  onOrbClick?: () => void;
}

const stateLabels: Record<OrbState, string> = {
  idle: 'Tap the button to speak',
  listening: 'I am listening now',
  thinking: 'Thinking...',
  muted: 'You are muted',
  error: 'Something went wrong. Try again.',
};

/**
 * BottomDock
 * Fixed bottom controls with VoiceOrb, captions toggle, and End button
 */
export default function BottomDock({ 
  state, 
  level, 
  captionsOn, 
  onToggleCaptions, 
  onEnd,
  onOrbClick 
}: BottomDockProps) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/70 border-t-2 border-transparent"
      style={{
        borderImageSource: 'linear-gradient(to right, #fcd34d, #fda4af)',
        borderImageSlice: 1,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Captions toggle */}
          <button
            onClick={onToggleCaptions}
            className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-white/40 rounded-full px-4 py-3 text-slate-700 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 transition-all min-h-[48px]"
            aria-label={captionsOn ? 'Turn off captions' : 'Turn on captions'}
          >
            {captionsOn ? (
              <Captions className="w-6 h-6" />
            ) : (
              <CaptionsOff className="w-6 h-6" />
            )}
            <span className="text-base font-medium hidden sm:inline">
              {captionsOn ? 'Captions On' : 'Captions Off'}
            </span>
          </button>

          {/* Center: VoiceOrb with status text */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <button
              onClick={onOrbClick}
              className="focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 rounded-full transition-all"
              aria-label="Voice assistant control"
            >
              <VoiceOrb level={level} state={state} />
            </button>
            <p className="text-base md:text-lg font-medium text-slate-700 text-center">
              {stateLabels[state]}
            </p>
          </div>

          {/* Right: End button */}
          <button
            onClick={onEnd}
            className="flex items-center gap-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-semibold rounded-full px-6 py-3 shadow-lg hover:from-rose-500 hover:to-rose-600 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 transition-all min-h-[48px]"
            aria-label="End conversation"
          >
            <X className="w-6 h-6" />
            <span className="text-base hidden sm:inline">End</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

