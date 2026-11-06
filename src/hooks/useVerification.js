import { useState, useCallback, useRef } from 'react';
import { validatePAN, validateAadhaarVerhoeff } from '../utils/validators';

export function useVerification(type = 'PAN', loanType = 'Personal') {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
  }, []);

  const verify = useCallback(
    (value) => {
      // Clear any pending timers
      if (timerRef.current) clearTimeout(timerRef.current);

      if (!value) {
        setIsVerifying(false);
        setIsVerified(false);
        setError(null);
        return;
      }

      // 1. Synchronously validate format & algorithms first
      let validationResult;
      if (type === 'PAN') {
        validationResult = validatePAN(value, loanType);
      } else if (type === 'Aadhaar') {
        validationResult = validateAadhaarVerhoeff(value);
      } else {
        validationResult = { isValid: true };
      }

      if (!validationResult.isValid) {
        setIsVerifying(false);
        setIsVerified(false);
        setError(validationResult.message);
        return;
      }

      // 2. Format is valid -> simulate 1.5-second async API call to NSDL / UIDAI
      setError(null);
      setIsVerifying(true);
      setIsVerified(false);

      timerRef.current = setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
      }, 1500);
    },
    [type, loanType]
  );

  return {
    isVerifying,
    isVerified,
    error,
    verify,
    reset,
  };
}