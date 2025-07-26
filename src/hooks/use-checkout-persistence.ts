/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckoutSession } from "@/lib/checkout/types/checkout.types";

interface CheckoutPersistenceData {
  sessionId: string;
  currentStep: number;
  selectedAddressId?: string;
  selectedShippingOption?: string;
  paymentMethod?: "MPESA" | "BANK_TRANSFER" | "CARD";
  customerPhone?: string;
  notes?: string;
  specialInstructions?: string;
  timestamp: number;
  expiresAt: string;
  formData?: Record<string, any>;
  validationErrors?: Record<string, string>;
  lastActivity: number;
}

interface UseCheckoutPersistenceReturn {
  // Core persistence methods
  persistStep: (step: number) => void;
  getStoredStep: () => number | null;
  persistFormData: (data: Partial<CheckoutPersistenceData>) => void;
  getStoredFormData: () => Partial<CheckoutPersistenceData> | null;
  clearStoredSession: () => void;

  // Session management
  isSessionExpired: () => boolean;
  getTimeRemaining: () => number;
  updateLastActivity: () => void;

  // Advanced features
  persistValidationErrors: (errors: Record<string, string>) => void;
  getStoredValidationErrors: () => Record<string, string> | null;
  clearValidationErrors: () => void;

  // Recovery methods
  canRecoverSession: () => boolean;
  recoverSession: () => Partial<CheckoutPersistenceData> | null;

  // Utilities
  getStorageKey: () => string;
  isStorageAvailable: () => boolean;
}

const STORAGE_PREFIX = "checkout_session_";
const STORAGE_EXPIRY_HOURS = 2; // 2 hours
const ACTIVITY_UPDATE_INTERVAL = 30000; // 30 seconds

// Type alias for timer to handle different environments
type TimerHandle = ReturnType<typeof setInterval>;

// Helper function to safely clear timers
const clearTimer = (timer: TimerHandle | null): void => {
  if (timer) {
    clearInterval(timer);
  }
};

export function useCheckoutPersistence(
  sessionId?: string
): UseCheckoutPersistenceReturn {
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [activityTimer, setActivityTimer] = useState<TimerHandle | null>(null);

  // Initialize storage availability check
  useEffect(() => {
    const hasWindow = typeof window !== "undefined";
    const hasLocalStorage = hasWindow && !!window.localStorage;
    setIsStorageReady(hasLocalStorage);
  }, []);

  // Generate storage key
  const getStorageKey = useCallback(() => {
    return `${STORAGE_PREFIX}${sessionId || "default"}`;
  }, [sessionId]);

  // Check if localStorage is available
  const isStorageAvailable = useCallback((): boolean => {
    try {
      if (!isStorageReady) return false;
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }, [isStorageReady]);

  // Get stored data with error handling
  const getStoredData = useCallback((): CheckoutPersistenceData | null => {
    if (!isStorageAvailable() || !sessionId) return null;

    try {
      const stored = localStorage.getItem(getStorageKey());
      if (!stored) return null;

      const data: CheckoutPersistenceData = JSON.parse(stored);

      // Validate data structure
      if (!data.sessionId || !data.timestamp) return null;

      // Check expiration
      if (Date.now() > new Date(data.expiresAt).getTime()) {
        localStorage.removeItem(getStorageKey());
        return null;
      }

      return data;
    } catch (error) {
      console.warn("Failed to parse stored checkout data:", error);
      localStorage.removeItem(getStorageKey());
      return null;
    }
  }, [isStorageAvailable, sessionId, getStorageKey]);

  // Store data with error handling
  const storeData = useCallback(
    (data: Partial<CheckoutPersistenceData>) => {
      if (!isStorageAvailable() || !sessionId) return;

      try {
        const existing = getStoredData() || ({} as CheckoutPersistenceData);
        const now = Date.now();

        const updatedData: CheckoutPersistenceData = {
          ...existing,
          ...data,
          sessionId,
          timestamp: now,
          lastActivity: now,
          expiresAt:
            data.expiresAt ||
            existing.expiresAt ||
            new Date(now + STORAGE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
        };

        localStorage.setItem(getStorageKey(), JSON.stringify(updatedData));
      } catch (error) {
        console.warn("Failed to store checkout data:", error);
      }
    },
    [isStorageAvailable, sessionId, getStorageKey, getStoredData]
  );

  // Core persistence methods
  const persistStep = useCallback(
    (step: number) => {
      storeData({ currentStep: step });
    },
    [storeData]
  );

  const getStoredStep = useCallback((): number | null => {
    const data = getStoredData();
    return data?.currentStep || null;
  }, [getStoredData]);

  const persistFormData = useCallback(
    (formData: Partial<CheckoutPersistenceData>) => {
      storeData(formData);
    },
    [storeData]
  );

  const getStoredFormData =
    useCallback((): Partial<CheckoutPersistenceData> | null => {
      return getStoredData();
    }, [getStoredData]);

  const clearStoredSession = useCallback(() => {
    if (!isStorageAvailable()) return;

    try {
      localStorage.removeItem(getStorageKey());

      // Clear activity timer
      clearTimer(activityTimer);
      setActivityTimer(null);
    } catch (error) {
      console.warn("Failed to clear stored session:", error);
    }
  }, [isStorageAvailable, getStorageKey, activityTimer]);

  // Session management
  const isSessionExpired = useCallback((): boolean => {
    const data = getStoredData();
    if (!data) return true;

    const isExpired = Date.now() > new Date(data.expiresAt).getTime();
    return isExpired;
  }, [getStoredData]);

  const getTimeRemaining = useCallback((): number => {
    const data = getStoredData();
    if (!data) return 0;

    const timeLeft = new Date(data.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(timeLeft / 1000)); // Return seconds
  }, [getStoredData]);

  const updateLastActivity = useCallback(() => {
    const data = getStoredData();
    if (data) {
      storeData({ lastActivity: Date.now() });
    }
  }, [getStoredData, storeData]);

  // Validation error management
  const persistValidationErrors = useCallback(
    (errors: Record<string, string>) => {
      storeData({ validationErrors: errors });
    },
    [storeData]
  );

  const getStoredValidationErrors = useCallback((): Record<
    string,
    string
  > | null => {
    const data = getStoredData();
    return data?.validationErrors || null;
  }, [getStoredData]);

  const clearValidationErrors = useCallback(() => {
    const data = getStoredData();
    if (data?.validationErrors) {
      const { validationErrors, ...rest } = data;
      storeData({ ...rest, validationErrors: undefined });
    }
  }, [getStoredData, storeData]);

  // Recovery methods
  const canRecoverSession = useCallback((): boolean => {
    const data = getStoredData();
    if (!data) return false;

    // Check if session is not expired and has meaningful data
    const hasValidData = Boolean(data.currentStep && data.currentStep > 1);
    const isNotExpired = !isSessionExpired();

    return hasValidData && isNotExpired;
  }, [getStoredData, isSessionExpired]);

  const recoverSession =
    useCallback((): Partial<CheckoutPersistenceData> | null => {
      if (!canRecoverSession()) return null;

      const data = getStoredData();
      if (!data) return null;

      // Update last activity on recovery
      updateLastActivity();

      return {
        currentStep: data.currentStep,
        selectedAddressId: data.selectedAddressId,
        selectedShippingOption: data.selectedShippingOption,
        paymentMethod: data.paymentMethod,
        customerPhone: data.customerPhone,
        notes: data.notes,
        specialInstructions: data.specialInstructions,
        formData: data.formData,
      };
    }, [canRecoverSession, getStoredData, updateLastActivity]);

  // Set up activity tracking
  useEffect(() => {
    if (!sessionId || !isStorageAvailable()) return;

    // Update activity immediately
    updateLastActivity();

    // Set up periodic activity updates
    const timer: TimerHandle = setInterval(() => {
      updateLastActivity();
    }, ACTIVITY_UPDATE_INTERVAL);

    setActivityTimer(timer);

    // Cleanup on unmount
    return () => {
      clearTimer(timer);
      setActivityTimer(null);
    };
  }, [sessionId, isStorageAvailable, updateLastActivity]);

  // Handle page visibility changes
  useEffect(() => {
    if (!sessionId || !isStorageAvailable()) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateLastActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionId, isStorageAvailable, updateLastActivity]);

  // Handle beforeunload to ensure data is saved
  useEffect(() => {
    if (!sessionId || !isStorageAvailable()) return;

    const handleBeforeUnload = () => {
      updateLastActivity();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionId, isStorageAvailable, updateLastActivity]);

  // Cleanup expired sessions from localStorage
  useEffect(() => {
    if (!isStorageAvailable()) return;

    const cleanupExpiredSessions = () => {
      try {
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(STORAGE_PREFIX)) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || "");
              if (Date.now() > new Date(data.expiresAt).getTime()) {
                keysToRemove.push(key);
              }
            } catch {
              // Invalid data, mark for removal
              keysToRemove.push(key);
            }
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));
      } catch (error) {
        console.warn("Failed to cleanup expired sessions:", error);
      }
    };

    // Clean up immediately and then periodically
    cleanupExpiredSessions();
    const cleanupTimer: TimerHandle = setInterval(
      cleanupExpiredSessions,
      5 * 60 * 1000
    ); // Every 5 minutes

    return () => {
      clearTimer(cleanupTimer);
    };
  }, [isStorageAvailable]);

  return {
    persistStep,
    getStoredStep,
    persistFormData,
    getStoredFormData,
    clearStoredSession,
    isSessionExpired,
    getTimeRemaining,
    updateLastActivity,
    persistValidationErrors,
    getStoredValidationErrors,
    clearValidationErrors,
    canRecoverSession,
    recoverSession,
    getStorageKey,
    isStorageAvailable,
  };
}

// Hook for session recovery with user confirmation
export function useCheckoutRecovery(sessionId?: string) {
  const persistence = useCheckoutPersistence(sessionId);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [recoveryData, setRecoveryData] =
    useState<Partial<CheckoutPersistenceData> | null>(null);

  useEffect(() => {
    if (sessionId && persistence.canRecoverSession()) {
      const data = persistence.recoverSession();
      if (data && data.currentStep && data.currentStep > 1) {
        setRecoveryData(data);
        setShowRecoveryPrompt(true);
      }
    }
  }, [sessionId, persistence]);

  const acceptRecovery = useCallback(() => {
    setShowRecoveryPrompt(false);
    return recoveryData;
  }, [recoveryData]);

  const declineRecovery = useCallback(() => {
    setShowRecoveryPrompt(false);
    setRecoveryData(null);
    persistence.clearStoredSession();
    return null;
  }, [persistence]);

  return {
    showRecoveryPrompt,
    recoveryData,
    acceptRecovery,
    declineRecovery,
    ...persistence,
  };
}

// Utility hook for auto-saving form data
export function useCheckoutAutoSave(
  sessionId: string | undefined,
  formData: Record<string, any>,
  debounceMs: number = 1000
) {
  const { persistFormData } = useCheckoutPersistence(sessionId);
  const [lastSaved, setLastSaved] = useState<number>(0);

  useEffect(() => {
    if (!sessionId || !formData) return;

    const timer = setTimeout(() => {
      persistFormData({ formData });
      setLastSaved(Date.now());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [sessionId, formData, debounceMs, persistFormData]);

  return {
    lastSaved,
    isAutoSaving: Date.now() - lastSaved < debounceMs,
  };
}
