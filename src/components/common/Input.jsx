import React, { createContext, useContext, forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

// Context to share id, error, and required status among compound sub-components
const InputContext = createContext(null);

function useInputContext() {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error('Input compound sub-components must be rendered within an <Input> wrapper.');
  }
  return context;
}

// 1. Root Input Container
export default function Input({
  id,
  name,
  error,
  required = false,
  className = '',
  children,
  // Convenience props for standalone usage:
  label,
  helpText,
  ...fieldProps
}) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  // If used as a standalone component without compound children
  if (!children) {
    return (
      <Input id={inputId} name={name} error={error} required={required} className={className}>
        {label && <Input.Label>{label}</Input.Label>}
        <Input.Field {...fieldProps} />
        {helpText && <Input.HelpText>{helpText}</Input.HelpText>}
        {error && <Input.Error />}
      </Input>
    );
  }

  return (
    <InputContext.Provider value={{ inputId, name, error, errorId, helpId, required }}>
      <div className={`flex flex-col w-full ${className}`}>
        {children}
      </div>
    </InputContext.Provider>
  );
}

// 2. Input.Label Sub-component
Input.Label = function InputLabel({ children, className = '' }) {
  const { inputId, required } = useInputContext();

  return (
    <label
      htmlFor={inputId}
      className={`text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1 ${className}`}
    >
      <span>{children}</span>
      {required && (
        <span className="text-[#E74C3C] text-sm" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
};

// 3. Input.Field Sub-component (Supports forwardRef for RHF)
Input.Field = forwardRef(function InputField(
  {
    type = 'text',
    className = '',
    placeholder = '',
    disabled = false,
    ...props
  },
  ref
) {
  const { inputId, name, error, errorId, helpId, required } = useInputContext();

  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

  return (
    <input
      ref={ref}
      id={inputId}
      name={name}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      aria-invalid={!!error}
      aria-describedby={describedBy}
      className={`min-h-[44px] px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white transition-all placeholder:text-slate-400 focus:outline-none ${
        error
          ? 'border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/20 focus:border-[#E74C3C]'
          : 'border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]'
      } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''} ${className}`}
      {...props}
    />
  );
});

// 4. Input.HelpText Sub-component
Input.HelpText = function InputHelpText({ children, className = '' }) {
  const { helpId } = useInputContext();

  return (
    <p id={helpId} className={`text-xs text-slate-500 mt-1 ${className}`}>
      {children}
    </p>
  );
};

// 5. Input.Error Sub-component
Input.Error = function InputError({ message, className = '' }) {
  const { error, errorId } = useInputContext();
  const errorMessage = message || error;

  return <ErrorMessage id={errorId} message={errorMessage} className={className} />;
};