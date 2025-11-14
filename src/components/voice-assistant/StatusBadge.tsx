import { tokens } from '@/lib/design-system/tokens';

type StatusState = 'idle' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

interface StatusBadgeProps {
  state: StatusState;
  label?: string;
}

const stateConfig: Record<StatusState, {
  bg: string;
  text: string;
  dot: string;
  pulse: boolean;
  label: string;
}> = {
  idle: {
    bg: tokens.colors.white,
    text: tokens.colors.gray[700],
    dot: tokens.colors.gray[400],
    pulse: false,
    label: 'Ready',
  },
  ready: {
    bg: tokens.colors.white,
    text: tokens.colors.gray[700],
    dot: tokens.colors.gray[400],
    pulse: false,
    label: 'Ready',
  },
  listening: {
    bg: tokens.colors.primary[50],
    text: tokens.colors.primary[700],
    dot: tokens.colors.primary[500],
    pulse: true,
    label: 'Listening',
  },
  processing: {
    bg: tokens.colors.warning[50],
    text: tokens.colors.warning[700],
    dot: tokens.colors.warning[500],
    pulse: true,
    label: 'Processing',
  },
  speaking: {
    bg: tokens.colors.success[50],
    text: tokens.colors.success[700],
    dot: tokens.colors.success[500],
    pulse: true,
    label: 'Speaking',
  },
  error: {
    bg: tokens.colors.error[50],
    text: tokens.colors.error[700],
    dot: tokens.colors.error[500],
    pulse: false,
    label: 'Error',
  },
};

export default function StatusBadge({ state, label }: StatusBadgeProps) {
  const config = stateConfig[state];
  const displayLabel = label || config.label;

  return (
    <div
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm shadow-sm transition-all duration-300"
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      <div
        className={`w-2 h-2 rounded-full ${config.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: config.dot }}
      />
      <span>{displayLabel}</span>
    </div>
  );
}
