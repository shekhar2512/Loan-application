import { useState, useEffect, useRef, useCallback } from 'react';
import { encryptData, decryptData } from '../utils/encryption';

const STORAGE_KEY = 'lendswift_draft_v1';

/**
 * Custom hook to debounce and encrypt form drafts to localStorage.
 * Auto-saves every 30 seconds or on manual trigger.
 * 
 * @param {Object} formData - Global multi-step form data
 * @param {number} currentStep - Currently active step number
 * @param {number} debounceMs - Debounce time in ms (default: 30000ms / 30s)
 */
export function useAutoSave(formData, currentStep, debounceMs = 30000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);

  const saveDraft = useCallback(
    async (dataToSave = formData, stepToSave = currentStep) => {
      setIsSaving(true);
      const payload = {
        formData: dataToSave,
        currentStep: stepToSave,
        savedAt: new Date().toISOString(),
      };

      const encrypted = await encryptData(payload);
      if (encrypted) {
        localStorage.setItem(STORAGE_KEY, encrypted);
        const timeString = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastSaved(timeString);
      }
      setIsSaving(false);
    },
    [formData, currentStep]
  );

  // Debounced auto-save effect (30s)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, currentStep, debounceMs, saveDraft]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLastSaved(null);
  }, []);

  const loadSavedDraft = useCallback(async () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const result = await decryptData(raw);
    if (result.isExpired || result.error) {
      clearDraft();
      return null;
    }
    return result.data;
  }, [clearDraft]);

  return {
    isSaving,
    lastSaved,
    saveDraft,
    clearDraft,
    loadSavedDraft,
  };
}