/**
 * SENIOR SAFEGUARD - THE GUARDIAN
 * Enterprise AI Monitoring System
 * Design System Foundation v1.0
 *
 * "Conscious Luxury" - Premium design that makes users feel protected, empowered, and calm
 */

// ===== COLOR PSYCHOLOGY & SPECTRAL DESIGN =====

export const colors = {
  // Primary: Guardian Cyan - Trust, clarity, medical precision
  guardianCyan: {
    base: '#00e5ff',
    rgb: 'rgb(0, 229, 255)',
    rgba: (opacity: number) => `rgba(0, 229, 255, ${opacity})`,
    glow: {
      blur: '20px',
      opacity: 0.4,
      spread: '8px',
    }
  },

  // Secondary: Ethereal Purple - Premium care, gentleness, wisdom
  etherealPurple: {
    base: '#a78bfa',
    rgb: 'rgb(167, 139, 250)',
    rgba: (opacity: number) => `rgba(167, 139, 250, ${opacity})`,
    glow: {
      blur: '15px',
      opacity: 0.3,
      spread: '5px',
    }
  },

  // Tertiary: Vital Green - Health, safety, active monitoring
  vitalGreen: {
    base: '#34d399',
    rgb: 'rgb(52, 211, 153)',
    rgba: (opacity: number) => `rgba(52, 211, 153, ${opacity})`,
    glow: {
      blur: '18px',
      opacity: 0.35,
      spread: '6px',
    }
  },

  // Alert: Attention Amber - Caution without panic
  attentionAmber: {
    base: '#fbbf24',
    rgb: 'rgb(251, 191, 36)',
    rgba: (opacity: number) => `rgba(251, 191, 36, ${opacity})`,
    glow: {
      blur: '25px',
      opacity: 0.5,
      spread: '10px',
    }
  },

  // Critical: Emergency Red - Immediate action required
  emergencyRed: {
    base: '#ef4444',
    rgb: 'rgb(239, 68, 68)',
    rgba: (opacity: number) => `rgba(239, 68, 68, ${opacity})`,
    glow: {
      blur: '30px',
      opacity: 0.6,
      spread: '12px',
    }
  },

  // Background Architecture - Four-point gradient
  background: {
    voidBlack: '#050a14',      // RGB(5, 10, 20) - Top-left
    deepSpace: '#0a0f1e',      // RGB(10, 15, 30) - Top-right
    midnightBlue: '#0f1729',   // RGB(15, 23, 41) - Bottom-left
    oceanDepth: '#151d33',     // RGB(21, 29, 51) - Bottom-right
  },

  // Text Color Semantic System
  text: {
    primary: {
      color: '#ffffff',
      opacity: 1.0,
      contrast: '16:1', // WCAG AAA
    },
    secondary: {
      color: '#cbd5e1', // Slate 300
      opacity: 0.85,
      contrast: '12:1',
    },
    tertiary: {
      color: '#94a3b8', // Slate 400
      opacity: 0.65,
      contrast: '7:1', // WCAG AA
    },
    disabled: {
      color: '#64748b', // Slate 500
      opacity: 0.4,
      contrast: '4.5:1',
    }
  }
};

// ===== TYPOGRAPHY SYSTEM - EXACT SPECIFICATIONS =====

export const typography = {
  // Font Stacks
  fontStack: {
    display: [
      '"SF Pro Display"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(', '),

    mono: [
      '"JetBrains Mono"',
      '"SF Mono"',
      'Menlo',
      'Monaco',
      '"Courier New"',
      'monospace',
    ].join(', '),
  },

  // Type Scale (Perfect Fourth - 1.333 ratio)
  scale: {
    display: {
      size: '72px',
      rem: '4.5rem',
      weight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      maxWidth: '16ch',
    },
    h1: {
      size: '48px',
      rem: '3rem',
      weight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.015em',
      maxWidth: '24ch',
    },
    h2: {
      size: '36px',
      rem: '2.25rem',
      weight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      maxWidth: '32ch',
    },
    h3: {
      size: '24px',
      rem: '1.5rem',
      weight: 500,
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    body: {
      size: '16px',
      rem: '1rem',
      weight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em',
      maxWidth: '65ch',
    },
    small: {
      size: '14px',
      rem: '0.875rem',
      weight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.005em',
    },
    micro: {
      size: '12px',
      rem: '0.75rem',
      weight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
      textTransform: 'uppercase',
    },
    mono: {
      size: '14px',
      rem: '0.875rem',
      weight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em',
      tabularNums: true,
    }
  }
};

// ===== GLASSMORPHISM MATERIAL SYSTEM =====

export const glassMaterial = {
  // Base Glass Card - "Frozen Glass"
  base: {
    background: 'rgba(255, 255, 255, 0.02)',
    backgroundGradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
    backdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    boxShadow: [
      'inset 0 1px 0 rgba(255, 255, 255, 0.05)',    // Inner highlight
      '0 8px 32px rgba(0, 0, 0, 0.37)',              // Primary depth
      '0 2px 8px rgba(0, 0, 0, 0.24)',               // Edge definition
      '0 0 1px rgba(255, 255, 255, 0.1)',            // Crisp outline
    ].join(', '),
  },

  // Shimmer Effect (Hover/Active)
  shimmer: {
    gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 60%)',
    transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Reflection Layer (Premium "machined edge")
  reflection: {
    gradient: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
    height: '1px',
  }
};

// ===== ANIMATION TIMINGS (Asymmetric for organic feel) =====

export const animations = {
  timings: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '600ms',
    slower: '800ms',

    // Asymmetric timings (organic, non-robotic)
    breath: '3500ms',      // 17 breaths per minute
    pulse: '2500ms',       // Gentle pulse
    drift: '20000ms',      // Nebula wisps
    twinkle: '4000ms',     // Star twinkle
  },

  easings: {
    standard: [0.4, 0, 0.2, 1] as const,     // Material Design
    decelerate: [0, 0, 0.2, 1] as const,     // Fast start, slow end
    accelerate: [0.4, 0, 1, 1] as const,     // Slow start, fast end
    sharp: [0.4, 0, 0.6, 1] as const,        // Quick & sharp
    spring: [0.34, 1.56, 0.64, 1] as const,  // Overshoot & settle
  },

  // Stagger delays (prime numbers for visual interest)
  staggers: {
    short: [97, 127, 157, 191, 223],    // ms
    medium: [271, 307, 347, 389, 433],  // ms
  }
};

// ===== GUARDIAN ORB STATES =====

export type GuardianState = 'idle' | 'listening' | 'thinking' | 'responding' | 'alert' | 'critical';

export const orbStates = {
  idle: {
    name: 'Watchful Guardian',
    emotion: 'Calm vigilance, peaceful monitoring',
    breathCycle: 3500,        // ms
    scale: { min: 1.0, max: 1.04 },
    rotation: 0.0005,         // rad/frame
    color: { cyan: 0.7, purple: 0.3 },
    glowIntensity: 0.5,
    transparency: 0.6,
    particleSpeed: 1.0,
    lightIntensity: 2.0,
    lightColor: colors.guardianCyan.base,
    statusText: 'Guardian Active',
    soundFrequency: 40,       // Hz
  },

  listening: {
    name: 'Attentive Presence',
    emotion: 'Focused attention, active engagement',
    breathCycle: 1500,        // 40 breaths per minute
    scale: { min: 1.0, max: 1.08 },
    rotation: 0,              // Locks facing user
    color: { cyan: 0.9, white: 0.1 },
    glowIntensity: 1.5,
    transparency: 0.7,
    particleSpeed: 2.0,
    lightIntensity: 3.5,
    lightColor: '#4df3ff',    // Bright cyan
    statusText: 'Listening...',
    soundFrequency: 60,
    showWaveform: true,
  },

  thinking: {
    name: 'Processing Intelligence',
    emotion: 'Active computation, working hard',
    breathCycle: 300,         // 200bpm - rapid micro-pulses
    scale: { min: 1.0, max: 1.02 },
    rotation: 0.0015,         // 3x speed
    color: 'swirling',        // Cyan/purple/green cycle
    glowIntensity: 1.0,       // Fluctuating 0.8-1.2
    transparency: 0.5,
    particleSpeed: 3.0,
    lightIntensity: 2.5,
    lightCycle: 1000,         // Color cycle speed
    statusText: 'Processing...',
    soundFrequency: 100,      // Complex harmonics 100-400Hz
    showNeuralNetwork: true,
  },

  responding: {
    name: 'Warm Communication',
    emotion: 'Friendly interaction, providing answer',
    breathCycle: 2500,
    scale: { min: 1.0, max: 1.05 },
    rotation: 0.0007,
    color: { cyan: 0.6, purple: 0.4 },
    glowIntensity: 1.0,
    transparency: 0.65,
    particleSpeed: 1.5,
    lightIntensity: 2.2,
    lightColor: '#8B5CF6',    // Warm cyan-purple blend
    statusText: 'Responding',
    soundFrequency: 50,
    showSpeechWaveform: true,
  },

  alert: {
    name: 'Urgent Attention Required',
    emotion: 'Something needs immediate attention',
    breathCycle: 1200,        // Irregular, anxious
    scale: { min: 1.0, max: 1.1 },
    rotation: 0.0005,
    wobble: true,             // Subtle wobble
    color: { amber: 1.0 },
    glowIntensity: 2.0,
    transparency: 0.75,
    particleSpeed: 2.5,
    lightIntensity: 4.0,
    lightColor: colors.attentionAmber.base,
    pulseFrequency: 1000,     // ms - strong pulse
    statusText: 'ATTENTION REQUIRED',
    soundFrequency: 120,
    soundPattern: 'ascending', // C-E-G notes
  },

  critical: {
    name: 'Emergency Situation',
    emotion: 'IMMEDIATE ACTION REQUIRED',
    breathCycle: 0,           // Stopped - held tension
    scale: { fixed: 1.15 },   // Enlarged, demanding attention
    rotation: 0,              // Frozen
    color: { red: 1.0 },
    glowIntensity: 3.0,       // Maximum
    transparency: 0.85,       // Highly opaque
    particleSpeed: 4.0,
    lightIntensity: 5.0,
    lightColor: '#ff0000',
    strobeFrequency: 500,     // ms - fast urgent
    statusText: 'EMERGENCY DETECTED',
    soundFrequency: 440,      // Emergency tone 440-880Hz
    soundVolume: 0.6,
    fullScreenTakeover: true,
  }
};

// ===== RESPONSIVE BREAKPOINTS =====

export const breakpoints = {
  desktop: {
    min: 1920,
    orbSize: 600,
    particleCount: 300,
    animationComplexity: 'full',
    fps: 60,
  },
  laptop: {
    min: 1440,
    orbSize: 500,
    particleCount: 300,
    animationComplexity: 'full',
    fps: 60,
  },
  tabletLandscape: {
    min: 1024,
    max: 1439,
    orbSize: 450,
    particleCount: 200,
    animationComplexity: 'simplified',
    fps: 30,
  },
  tabletPortrait: {
    min: 768,
    max: 1023,
    orbSize: 400,
    particleCount: 150,
    animationComplexity: 'simplified',
    fps: 30,
  },
  mobile: {
    max: 767,
    orbSize: 320,
    particleCount: 50,
    animationComplexity: 'minimal',
    fps: 30,
  }
};

// ===== ACCESSIBILITY =====

export const accessibility = {
  // WCAG 2.1 Level AAA
  contrastRatios: {
    normalText: 7.0,     // AAA
    largeText: 4.5,      // AAA
    uiComponents: 3.0,   // AA
  },

  // Focus indicators
  focus: {
    outline: `2px solid ${colors.guardianCyan.base}`,
    outlineOffset: '4px',
    borderRadius: '4px',
  },

  // Motion preferences
  reducedMotion: {
    orbRotation: 0.0001,       // Very slow
    particleCount: 50,
    transitionDuration: '150ms',
    noParallax: true,
  },

  // Touch targets
  touchTarget: {
    minimum: 44,         // px - iOS guideline
    recommended: 48,     // px - Android guideline
    comfortable: 60,     // px - Premium standard
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Generate glow box-shadow for any color
 */
export const generateGlow = (color: string, intensity: number = 1, blur: number = 20, spread: number = 8) => {
  const opacity = 0.4 * intensity;
  return `0 0 ${blur}px ${spread}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

/**
 * Get responsive orb size based on viewport
 */
export const getResponsiveOrbSize = (width: number): number => {
  if (width >= breakpoints.desktop.min) return breakpoints.desktop.orbSize;
  if (width >= breakpoints.laptop.min) return breakpoints.laptop.orbSize;
  if (width >= breakpoints.tabletLandscape.min) return breakpoints.tabletLandscape.orbSize;
  if (width >= breakpoints.tabletPortrait.min) return breakpoints.tabletPortrait.orbSize;
  return Math.min(width * 0.8, breakpoints.mobile.orbSize);
};

/**
 * Get particle count based on device capability
 */
export const getParticleCount = (width: number): number => {
  if (width >= breakpoints.laptop.min) return 300;
  if (width >= breakpoints.tabletLandscape.min) return 200;
  if (width >= breakpoints.tabletPortrait.min) return 150;
  return 50;
};

/**
 * Create four-point background gradient
 */
export const createBackgroundGradient = () => {
  return `
    radial-gradient(circle at 20% 20%, ${colors.background.voidBlack} 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, ${colors.background.deepSpace} 0%, transparent 50%),
    radial-gradient(circle at 20% 80%, ${colors.background.midnightBlue} 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, ${colors.background.oceanDepth} 0%, transparent 50%),
    linear-gradient(165deg, ${colors.background.voidBlack} 0%, ${colors.background.oceanDepth} 100%)
  `.trim().replace(/\s+/g, ' ');
};

/**
 * Get state-specific color
 */
export const getStateColor = (state: GuardianState): string => {
  switch (state) {
    case 'idle':
    case 'listening':
    case 'responding':
      return colors.guardianCyan.base;
    case 'thinking':
      return colors.etherealPurple.base;
    case 'alert':
      return colors.attentionAmber.base;
    case 'critical':
      return colors.emergencyRed.base;
    default:
      return colors.guardianCyan.base;
  }
};

export default {
  colors,
  typography,
  glassMaterial,
  animations,
  orbStates,
  breakpoints,
  accessibility,
  generateGlow,
  getResponsiveOrbSize,
  getParticleCount,
  createBackgroundGradient,
  getStateColor,
};
