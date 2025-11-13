'use client';

/**
 * SunlightBackground
 * Layered ethereal background with radial glows, conic gradients, and vignette
 */
export default function SunlightBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* Layer 1: Base color */}
      <div className="absolute inset-0" style={{ backgroundColor: '#FFFDF7' }} />
      
      {/* Layer 2: Radial glows */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(1200px 800px at 15% 10%, rgba(253, 230, 138, 0.20), transparent 50%)'
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(1000px 700px at 85% 90%, rgba(251, 207, 232, 0.20), transparent 50%)'
        }}
      />
      
      {/* Layer 3: Conic "sunbeam" wash with blur */}
      <div 
        className="absolute inset-0 opacity-20 blur-2xl"
        style={{
          background: 'conic-gradient(from 180deg at 50% 50%, rgba(253, 230, 138, 0.20), rgba(251, 207, 232, 0.20), rgba(254, 205, 211, 0.20), rgba(253, 230, 138, 0.20))'
        }}
      />
      
      {/* Layer 4: Vignette mask */}
      <div 
        className="absolute inset-0"
        style={{
          maskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(70% 70% at 50% 50%, black, transparent)',
          background: 'linear-gradient(to bottom, rgba(255, 253, 247, 0.3), transparent)'
        }}
      />
    </div>
  );
}

