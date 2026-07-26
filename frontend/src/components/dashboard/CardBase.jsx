import React from 'react';

const CardBase = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}> 
      {children}
    </div>
  );
};

export default CardBase;
