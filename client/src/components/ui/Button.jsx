import React from 'react';

const Button = ({
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm',
    secondary: 'bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-slate-700/60',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
    destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
