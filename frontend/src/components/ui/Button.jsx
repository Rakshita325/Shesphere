import React from 'react';

const Button = ({ children, variant = 'primary', className = '', isLoading, icon, ...props }) => {
  const baseStyles = "w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-pink-400 hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-600 text-white shadow-sm hover:shadow-md",
    outline: "bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
    ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-gray-800"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : (
        <>
          {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
