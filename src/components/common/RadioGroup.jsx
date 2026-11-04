import React, { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const RadioGroup = forwardRef(function RadioGroup(
  {
    name,
    label,
    options = [],
    value,
    defaultValue,
    onChange,
    layout = 'horizontal', // 'horizontal' | 'vertical' | 'grid'
    error,
    required = false,
    className = '',
    ...props
  },
  ref
) {
  const errorId = error ? `${name}-error` : undefined;

  const layoutClasses = {
    horizontal: 'grid grid-cols-1 sm:grid-cols-3 gap-3',
    vertical: 'flex flex-col gap-2.5',
    grid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3',
  };

  return (
    <fieldset
      className={`w-full border-none p-0 m-0 ${className}`}
      aria-invalid={!!error}
      aria-describedby={errorId}
    >
      {/* Legend / Label */}
      {label && (
        <legend className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1">
          <span>{label}</span>
          {required && (
            <span className="text-[#E74C3C] text-sm" aria-hidden="true">
              *
            </span>
          )}
        </legend>
      )}

      {/* Options Container */}
      <div className={layoutClasses[layout] || layoutClasses.horizontal} role="radiogroup">
        {options.map((option) => {
          const optValue = typeof option === 'object' ? option.value : option;
          const optLabel = typeof option === 'object' ? option.label : option;
          const optDesc = typeof option === 'object' ? option.description : null;
          const optBadge = typeof option === 'object' ? option.badge : null;
          const optId = `${name}-${String(optValue).toLowerCase().replace(/\s+/g, '-')}`;

          // Check if selected (supports both controlled value and default uncontrolled state)
          const isChecked = value !== undefined ? value === optValue : undefined;

          return (
            <label
              key={optValue}
              htmlFor={optId}
              className={`relative flex items-start p-3.5 rounded-xl border text-left cursor-pointer transition-all select-none ${
                isChecked
                  ? 'border-[#1F4E79] bg-blue-50/40 ring-1 ring-[#1F4E79]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              } ${error ? 'border-red-300' : ''}`}
            >
              {/* Radio Circle Input */}
              <div className="flex items-center h-5 mr-3">
                <input
                  ref={ref}
                  id={optId}
                  name={name}
                  type="radio"
                  value={optValue}
                  checked={isChecked}
                  defaultChecked={defaultValue === optValue}
                  onChange={onChange}
                  className="w-4 h-4 text-[#1F4E79] border-slate-300 focus:ring-[#1F4E79] cursor-pointer"
                  {...props}
                />
              </div>

              {/* Text Info & Badges */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold text-slate-900">
                    {optLabel}
                  </span>
                  {optBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#27AE60] border border-emerald-200">
                      {optBadge}
                    </span>
                  )}
                </div>
                {optDesc && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {optDesc}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Error Message */}
      {error && <ErrorMessage id={errorId} message={error} className="mt-2" />}
    </fieldset>
  );
});

export default RadioGroup;