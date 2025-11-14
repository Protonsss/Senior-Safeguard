import { ButtonHTMLAttributes, ReactNode } from 'react';
import { tokens } from '@/lib/design-system/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-[${tokens.colors.primary[600]}] to-[${tokens.colors.primary[700]}]
    text-white
    shadow-lg
    hover:shadow-xl hover:from-[${tokens.colors.primary[700]}] hover:to-[${tokens.colors.primary[800]}]
    active:scale-[0.98]
    disabled:from-[${tokens.colors.gray[300]}] disabled:to-[${tokens.colors.gray[300]}]
    disabled:cursor-not-allowed disabled:shadow-none
  `,
  secondary: `
    bg-white
    text-[${tokens.colors.gray[700]}]
    border-2 border-[${tokens.colors.gray[200]}]
    shadow-sm
    hover:border-[${tokens.colors.gray[300]}] hover:shadow-md
    active:scale-[0.98]
    disabled:bg-[${tokens.colors.gray[100]}] disabled:text-[${tokens.colors.gray[400]}]
    disabled:cursor-not-allowed
  `,
  success: `
    bg-gradient-to-r from-[${tokens.colors.success[500]}] to-[${tokens.colors.success[600]}]
    text-white
    shadow-lg
    hover:shadow-xl hover:from-[${tokens.colors.success[600]}] hover:to-[${tokens.colors.success[700]}]
    active:scale-[0.98]
    disabled:from-[${tokens.colors.gray[300]}] disabled:to-[${tokens.colors.gray[300]}]
    disabled:cursor-not-allowed disabled:shadow-none
  `,
  danger: `
    bg-gradient-to-r from-[${tokens.colors.error[500]}] to-[${tokens.colors.error[600]}]
    text-white
    shadow-lg
    hover:shadow-xl hover:from-[${tokens.colors.error[600]}] hover:to-[${tokens.colors.error[700]}]
    active:scale-[0.98]
    disabled:from-[${tokens.colors.gray[300]}] disabled:to-[${tokens.colors.gray[300]}]
    disabled:cursor-not-allowed disabled:shadow-none
  `,
  ghost: `
    bg-transparent
    text-[${tokens.colors.gray[700]}]
    hover:bg-[${tokens.colors.gray[100]}]
    active:bg-[${tokens.colors.gray[200]}]
    disabled:text-[${tokens.colors.gray[400]}] disabled:cursor-not-allowed
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: `px-4 py-2 text-sm font-medium rounded-lg`,
  md: `px-6 py-3 text-base font-semibold rounded-xl`,
  lg: `px-8 py-4 text-lg font-semibold rounded-xl`,
  xl: `px-10 py-6 text-xl font-bold rounded-2xl`,
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-[${tokens.colors.primary[200]}]
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
