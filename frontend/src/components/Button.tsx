import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'primary' | 'sm' | 'lg' | 'pill';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'primary',
  icon,
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const baseClass = [
    'inline-flex items-center justify-center gap-2 font-semibold select-none whitespace-nowrap shrink-0',
    'cursor-pointer transition-all duration-150 ease-out',
    'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
  ].join(' ');

  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = 'bg-brand-primary hover:bg-brand-hover text-white shadow-sm';
      break;
    case 'secondary':
      variantClass = 'bg-brand-card border border-brand-border text-brand-text-primary hover:bg-brand-surface';
      break;
    case 'success':
      variantClass = 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400';
      break;
    case 'warning':
      variantClass = 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm';
      break;
    case 'error':
      variantClass = 'bg-rose-500/10 border border-rose-500/20 text-rose-600 hover:bg-rose-500/20 dark:text-rose-450 dark:text-rose-400';
      break;
    case 'ghost':
      variantClass = 'bg-transparent text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary';
      break;
  }

  let sizeClass = '';
  switch (size) {
    case 'primary':
      sizeClass = 'h-12 min-w-[90px] px-5 py-3 rounded-2xl text-[15px]';
      break;
    case 'sm':
      sizeClass = 'h-11 min-w-[80px] px-5 py-2.5 rounded-2xl text-sm';
      break;
    case 'lg':
      sizeClass = 'h-[52px] min-w-[100px] px-6 py-4 rounded-2xl text-base';
      break;
    case 'pill':
      sizeClass = 'h-9 min-w-[72px] px-4 py-2 rounded-full text-xs';
      break;
  }

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      style={style}
      {...props}
    >
      {icon && <span className="flex items-center justify-center shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// Dedicated StartButton component for consistency
export const StartButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children = 'Start',
  className = '',
  ...props
}) => (
  <Button
    variant="primary"
    size="sm"
    className={`min-w-[80px] ${className}`}
    {...props}
  >
    {children}
  </Button>
);

