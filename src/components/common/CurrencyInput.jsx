import React, { useState, useEffect, forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';
import { formatIndianCurrency, formatInWords } from '../../utils/formatters';


const CurrencyInput = forwardRef(function CurrencyInput(
  {
    id,
    name,
    label,
    value,
    defaultValue,
    onChange,
    onBlur,
    error,
    helpText,
    placeholder = '0',
    required = false,
    disabled = false,
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  // Initialize display string
  const initialRaw = value !== undefined ? value : defaultValue || '';
  const [displayValue, setDisplayValue] = useState(() => formatIndianCurrency(initialRaw));

  useEffect(() => {
    if (value !== undefined) {
      setDisplayValue(formatIndianCurrency(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setDisplayValue(formatIndianCurrency(rawVal));

    if (onChange) {
      // Pass clean numeric value to React Hook Form / Zod
      const numericVal = rawVal ? Number(rawVal) : '';
      onChange(numericVal);
    }
  };

  const amountInWords = formatInWords(displayValue);

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Label & Amount in Words Badge */}
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && (
              <span className="text-[#E74C3C] text-sm" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        {amountInWords && (
          <span className="text-xs font-semibold text-[#1F4E79] bg-blue-50 px-2 py-0.5 rounded-md">
            {amountInWords}
          </span>
        )}
      </div>

      {/* Input with Rupee Prefix */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold text-sm">
          ₹
        </div>
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
          className={`w-full min-h-[44px] pl-8 pr-3.5 py-2.5 rounded-lg border text-sm font-medium text-slate-900 bg-white transition-all placeholder:text-slate-400 focus:outline-none ${
            error
              ? 'border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/20 focus:border-[#E74C3C]'
              : 'border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]'
          } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
          {...props}
        />
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

export default CurrencyInput;