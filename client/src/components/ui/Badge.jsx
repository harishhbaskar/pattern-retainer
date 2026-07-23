import React from 'react';

const Badge = ({ variant = 'default', children, className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors';

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    indigo: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60',
    green: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60',
    red: 'bg-red-950/80 text-red-300 border border-red-800/60',
    amber: 'bg-amber-950/80 text-amber-300 border border-amber-800/60',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
