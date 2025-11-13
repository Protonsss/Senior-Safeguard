'use client';

import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * GlassPanel
 * Glass morphism panel with backdrop blur and subtle borders
 */
export default function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div className={`backdrop-blur-xl bg-white/60 ring-1 ring-white/30 rounded-2xl shadow-xl shadow-amber-100/40 ${className}`}>
      {children}
    </div>
  );
}

