import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-[#1E293B] border border-slate-700/60 rounded-xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
