'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';

interface InsightAction {
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface ScreenInsightCardProps {
  title: string;
  summary: string;
  actions: InsightAction[];
  thumbnailUrl?: string;
}

/**
 * ScreenInsightCard
 * Shows what the AI sees on screen and suggests actions
 */
export default function ScreenInsightCard({ 
  title, 
  summary, 
  actions, 
  thumbnailUrl 
}: ScreenInsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <GlassPanel className="p-6 space-y-4">
        {/* Title */}
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
          {title}
        </h2>

        {/* Summary */}
        <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
          {summary}
        </p>

        {/* Screenshot thumbnail */}
        {thumbnailUrl && (
          <div className="relative rounded-xl overflow-hidden ring-1 ring-white/40">
            <img 
              src={thumbnailUrl} 
              alt="Screen preview" 
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <p className="text-base font-medium text-slate-700">Try this:</p>
          {actions.map((action, idx) => (
            <motion.button
              key={idx}
              onClick={action.onClick}
              className="w-full bg-gradient-to-r from-amber-300 to-rose-300 text-slate-900 font-medium rounded-xl px-6 py-4 shadow-lg hover:from-amber-400 hover:to-rose-400 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 transition-all text-left flex items-center gap-3"
              whileHover={{ y: -2, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              {action.icon && (
                <span className="flex-shrink-0 text-2xl">{action.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold">{action.label}</div>
                {action.sublabel && (
                  <div className="text-base text-slate-700 mt-1">{action.sublabel}</div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </GlassPanel>
    </motion.div>
  );
}

