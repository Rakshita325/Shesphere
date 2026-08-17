import React from 'react';

const CardBase = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 transition-colors ${className}`}> 
      {children}
    </div>
  );
};

export default CardBase;
