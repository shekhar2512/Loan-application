import { useState, useCallback, useRef } from 'react';
import pinCodeData from '../utils/pinCodeData.json';

/**
 * Custom hook to lookup Indian PIN codes and auto-fill City and State.
 * Simulates a realistic 300ms asynchronous postal directory lookup.
 * 
 * @param {Function} setValue - React Hook Form's setValue function (optional)
 * @param {Object} options - Configuration options
 * @param {string} options.cityField - Form field name for city
 * @param {string} options.stateField - Form field name for state
 * @returns {Object} { lookup, isLoading, isFound, pinDetails, error, isMismatch, checkStateMismatch, reset }
 */
export function usePinCodeLookup(setValue = null, options = {}) {
  const { cityField = 'currentCity', stateField = 'currentState' } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [isFound, setIsFound] = useState(false);
  const [pinDetails, setPinDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isMismatch, setIsMismatch] = useState(false);

  const timeoutRef = useRef(null);

  const lookup = useCallback((pinCode) => {
    // Clear any pending lookup
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const cleanPin = String(pinCode || '').trim();

    // Check 6-digit Indian PIN format (first digit cannot be 0)
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setIsFound(false);
      setPinDetails(null);
      setIsMismatch(false);
      if (cleanPin.length > 0 && cleanPin.length !== 6) {
        setError('PIN code must be exactly 6 digits.');
      } else {
        setError(null);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsMismatch(false);

    // Simulate 300ms async postal API response
    timeoutRef.current = setTimeout(() => {
      const match = pinCodeData[cleanPin];

      if (match) {
        setIsFound(true);
        setPinDetails(match);
        setError(null);

        // Auto-fill form fields if setValue is provided
        if (setValue) {
          setValue(cityField, match.city, { shouldValidate: true, shouldDirty: true });
          setValue(stateField, match.state, { shouldValidate: true, shouldDirty: true });
        }
      } else {
        setIsFound(false);
        setPinDetails(null);
        setError('PIN code not in offline directory. Please enter City & State manually.');
      }

      setIsLoading(false);
    }, 300);
  }, [setValue, cityField, stateField]);

  // Check if entered state contradicts the PIN code's registered state
  const checkStateMismatch = useCallback((currentStateValue) => {
    if (pinDetails && currentStateValue) {
      const normalizedEntered = currentStateValue.trim().toLowerCase();
      const normalizedPinState = pinDetails.state.trim().toLowerCase();
      setIsMismatch(normalizedEntered !== normalizedPinState);
    } else {
      setIsMismatch(false);
    }
  }, [pinDetails]);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsLoading(false);
    setIsFound(false);
    setPinDetails(null);
    setError(null);
    setIsMismatch(false);
  }, []);

  return {
    lookup,
    isLoading,
    isFound,
    pinDetails,
    error,
    isMismatch,
    checkStateMismatch,
    reset,
  };
}