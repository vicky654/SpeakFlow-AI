import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'pill';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes including native reset, flex centering, transitions, active state scale micro-animations
  const baseClass = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none whitespace-nowrap shrink-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer border border-transparent';

  // Variant class mapping
  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = 'bg-brand-primary hover:opacity-95 text-white shadow-sm';
      break;
    case 'secondary':
      variantClass = 'bg-brand-surface border-brand-border text-brand-text-primary hover:bg-brand-bg';
      break;
    case 'success':
      variantClass = 'bg-brand-success/15 border-brand-success/20 text-brand-success hover:bg-brand-success/20';
      break;
    case 'warning':
      variantClass = 'bg-brand-warning text-white hover:brightness-105 shadow-sm';
      break;
    case 'error':
      variantClass = 'bg-brand-error/15 border-brand-error/20 text-brand-error hover:bg-brand-error/20';
      break;
    case 'ghost':
      variantClass = 'bg-transparent text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text-primary border-none';
      break;
  }

  // Size class mapping to handle button padding and heights
  let sizeClass = '';
  switch (size) {
    case 'sm':
      sizeClass = 'min-h-[36px] px-4 py-2 text-xs rounded-xl';
      break;
    case 'md':
      sizeClass = 'min-h-[44px] px-5 py-3 text-sm rounded-[14px]';
      break;
    case 'lg':
      sizeClass = 'min-h-[52px] px-6 py-4 text-base rounded-[14px]';
      break;
    case 'pill':
      sizeClass = 'min-h-[38px] px-4.5 py-2.5 text-xs rounded-full';
      break;
  }

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center justify-center shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
