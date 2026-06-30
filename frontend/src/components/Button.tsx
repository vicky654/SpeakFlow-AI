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
      variantClass = 'bg-gradient-to-r from-[#6D5DF6] to-[#8B5CF6] text-white shadow-sm hover:brightness-105';
      break;
    case 'secondary':
      variantClass = 'bg-white border border-[#E8ECF5] text-[#111827] hover:bg-[#FAFBFC]';
      break;
    case 'success':
      variantClass = 'bg-green-50 border border-green-200 text-green-600 hover:bg-green-100';
      break;
    case 'warning':
      variantClass = 'bg-amber-500 text-white hover:brightness-105 shadow-sm';
      break;
    case 'error':
      variantClass = 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100';
      break;
    case 'ghost':
      variantClass = 'bg-transparent text-[#6B7280] hover:bg-[#FAFBFC] hover:text-[#111827]';
      break;
  }

  let sizeClass = '';
  switch (size) {
    case 'primary':
      sizeClass = 'h-12 min-w-[90px] px-5 py-3 rounded-2xl text-sm';
      break;
    case 'sm':
      sizeClass = 'h-11 min-w-[80px] px-5 py-2.5 rounded-[12px] text-sm';
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

