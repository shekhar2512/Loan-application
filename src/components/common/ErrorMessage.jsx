import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ id, message, className = '' }) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium text-[#E74C3C] ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}