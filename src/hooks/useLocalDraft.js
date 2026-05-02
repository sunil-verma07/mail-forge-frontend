import { useEffect, useCallback } from 'react';

const DRAFT_KEY = 'mailforge_draft';

/**
 * Persist form values as a draft in localStorage
 */
export function useLocalDraft(watch, reset) {
  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        reset(draft);
      }
    } catch (_) {}
  }, [reset]);

  // Save draft whenever form values change
  useEffect(() => {
    const subscription = watch((values) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch (_) {}
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (_) {}
  }, []);

  return { clearDraft };
}
