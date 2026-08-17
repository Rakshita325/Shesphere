import React, { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4 relative">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pastel-pink dark:focus:ring-pink-900/50 transition-all appearance-none ${
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-pastel-pink dark:focus:border-pink-400'
          } ${className}`}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
