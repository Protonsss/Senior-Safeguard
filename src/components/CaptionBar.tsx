'use client';

import { motion } from 'framer-motion';

interface CaptionBarProps {
  text: string;
}

/**
 * CaptionBar
 * Always-visible caption text for hearing accessibility
 */
export default function CaptionBar({ text }: CaptionBarProps) {
  if (!text) return null;

  return (
    <motion.div
      className="w-full px-6 py-4 backdrop-blur-xl bg-white/70 border-t border-white/40"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-lg md:text-xl text-slate-900 font-medium leading-relaxed">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

