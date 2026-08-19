import React from 'react';

const CardBase = ({ children, className = '' }) => {
  return (
    <div className={`glass-card card-hover-3d rounded-3xl p-6 transition-all duration-300 ${className}`}> 
      {children}
    </div>
  );
};

export default CardBase;
