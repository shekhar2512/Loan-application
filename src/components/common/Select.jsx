import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

const Select = forwardRef(function Select(
  {
    id,
    name,
    label,
    options = [],
    placeholder = 'Select an option',
    error,
    helpText,
    required = false,
    disabled = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const selectId = id || name;
  const errorId = error ? `${selectId}-error` : undefined;
  const helpId = helpText ? `${selectId}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1"
        >
          <span>{label}</span>
          {required && (
            <span className="text-[#E74C3C] text-sm" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Select Field with Custom Chevron */}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          defaultValue=""
          className={`w-full min-h-[44px] pl-3.5 pr-10 py-2.5 rounded-lg border text-sm text-slate-900 bg-white appearance-none transition-all focus:outline-none cursor-pointer ${
            error
              ? 'border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/20 focus:border-[#E74C3C]'
              : 'border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]'
          } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.length > 0
            ? options.map((opt) => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const lbl = typeof opt === 'object' ? opt.label : opt;
                const isDisabled = typeof opt === 'object' ? opt.disabled : false;
                return (
                  <option key={val} value={val} disabled={isDisabled}>
                    {lbl}
                  </option>
                );
              })
            : children}
        </select>

        {/* Dropdown Chevron Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Help Text */}
      {helpText && (
        <p id={helpId} className="text-xs text-slate-500 mt-1">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && <ErrorMessage id={errorId} message={error} />}
    </div>
  );
});

export default Select;