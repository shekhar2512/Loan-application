import React, { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const Checkbox = forwardRef(function Checkbox(
  {
    id,
    name,
    label,
    description,
    error,
    required = false,
    disabled = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const checkboxId = id || name;
  const errorId = error ? `${checkboxId}-error` : undefined;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label
        htmlFor={checkboxId}
        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
          error
            ? 'border-[#E74C3C] bg-red-50/20'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Checkbox Input */}
        <div className="flex items-center h-5 mt-0.5">
          <input
            ref={ref}
            id={checkboxId}
            name={name}
            type="checkbox"
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className="w-4 h-4 rounded text-[#1F4E79] border-slate-300 focus:ring-2 focus:ring-[#1F4E79] focus:ring-offset-1 cursor-pointer"
            {...props}
          />
        </div>

        {/* Label & Description */}
        <div className="text-sm">
          <div className="font-medium text-slate-800 leading-snug">
            {label || children}
            {required && (
              <span className="text-[#E74C3C] ml-1" aria-hidden="true">
                *
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </label>

      {/* Error Message */}
      {error && <ErrorMessage id={errorId} message={error} className="mt-1.5 ml-1" />}
    </div>
  );
});

export default Checkbox;