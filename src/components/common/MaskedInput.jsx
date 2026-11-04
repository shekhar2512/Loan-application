import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import { maskSensitiveValue } from '../../utils/formatters';

const MaskedInput = forwardRef(function MaskedInput(
  {
    id,
    name,
    label,
    maskType = 'aadhaar', // 'aadhaar' | 'pan' | 'general'
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    error,
    helpText,
    placeholder = '',
    required = false,
    disabled = false,
    maxLength,
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  const [rawVal, setRawVal] = useState(value !== undefined ? value : defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showPlain, setShowPlain] = useState(false);

  // Sync state if controlled value changes externally
  React.useEffect(() => {
    if (value !== undefined) {
      setRawVal(value);
    }
  }, [value]);

  const handleInputChange = (e) => {
    let val = e.target.value;
    // Format PAN to uppercase automatically
    if (maskType === 'pan') {
      val = val.toUpperCase();
    }
    setRawVal(val);
    if (onChange) {
      e.target.value = val;
      onChange(e);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // While typing or focused or eye toggle is active, show real value. Otherwise mask it.
  const displayValue = isFocused || showPlain ? rawVal : maskSensitiveValue(rawVal, maskType);

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between"
        >
          <span className="flex items-center gap-1">
            <span>{label}</span>
            {required && (
              <span className="text-[#E74C3C] text-sm" aria-hidden="true">
                *
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Masked for PII Privacy
          </span>
        </label>
      )}

      {/* Input Field with Toggle Visibility Eye */}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
          className={`w-full min-h-[44px] pl-3.5 pr-11 py-2.5 rounded-lg border text-sm font-mono tracking-wider text-slate-900 bg-white transition-all placeholder:text-slate-400 focus:outline-none ${
            error
              ? 'border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/20 focus:border-[#E74C3C]'
              : 'border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]'
          } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
          {...props}
        />

        {/* Show/Hide Toggle Button */}
        {rawVal && (
          <button
            type="button"
            onClick={() => setShowPlain((prev) => !prev)}
            aria-label={showPlain ? 'Hide sensitive number' : 'Show sensitive number'}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
          >
            {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
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

export default MaskedInput;