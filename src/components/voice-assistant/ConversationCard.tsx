import { ReactNode } from 'react';
import { tokens } from '@/lib/design-system/tokens';

type ConversationRole = 'user' | 'assistant';

interface ConversationCardProps {
  role: ConversationRole;
  children: ReactNode;
}

const roleConfig: Record<ConversationRole, {
  label: string;
  bg: string;
  labelColor: string;
  textColor: string;
  shadow: string;
}> = {
  user: {
    label: 'You',
    bg: tokens.colors.white,
    labelColor: tokens.colors.gray[500],
    textColor: tokens.colors.gray[900],
    shadow: tokens.shadows.sm,
  },
  assistant: {
    label: 'Assistant',
    bg: `linear-gradient(to bottom right, ${tokens.colors.primary[50]}, ${tokens.colors.primary[100]})`,
    labelColor: tokens.colors.primary[700],
    textColor: tokens.colors.gray[900],
    shadow: tokens.shadows.sm,
  },
};

export default function ConversationCard({ role, children }: ConversationCardProps) {
  const config = roleConfig[role];

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:shadow-md"
      style={{
        background: config.bg,
        boxShadow: config.shadow,
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: config.labelColor }}
      >
        {config.label}
      </p>
      <div
        className="text-lg leading-relaxed"
        style={{ color: config.textColor }}
      >
        {children}
      </div>
    </div>
  );
}
