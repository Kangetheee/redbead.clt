import { useState, useEffect, useCallback } from "react";

interface CheckoutState {
  sessionId: string;
  currentStep: number;
  shippingAddressId?: string;
  billingAddressId?: string;
  selectedShippingOption?: string;
  paymentMethod?: string;
  customerPhone?: string;
  notes?: string;
  specialInstructions?: string;
  timestamp: number;
}

const STORAGE_KEY = "checkout_state";
const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

export function useCheckoutPersistence(sessionId?: string) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize persistence on mount
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Get stored checkout state
  const getStoredState = useCallback((): CheckoutState | null => {
    if (!isInitialized || typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const state: CheckoutState = JSON.parse(stored);

      // Check if state has expired
      if (Date.now() - state.timestamp > EXPIRY_TIME) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Check if session matches
      if (sessionId && state.sessionId !== sessionId) {
        return null;
      }

      return state;
    } catch (error) {
      console.error("Error reading checkout state:", error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, [isInitialized, sessionId]);

  // When storing the session ID in localStorage
  const storeState = useCallback(
    (state: Partial<CheckoutState>) => {
      if (!isInitialized || typeof window === "undefined" || !sessionId) return;

      try {
        // Clean the sessionId before storing
        const cleanSessionId = sessionId.split("?")[0];

        const currentState = getStoredState() || {
          sessionId: cleanSessionId, // Use clean ID here
          currentStep: 1,
          timestamp: Date.now(),
        };

        const newState: CheckoutState = {
          ...currentState,
          ...state,
          sessionId: cleanSessionId, // Use clean ID here
          timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.error("Error storing checkout state:", error);
      }
    },
    [isInitialized, sessionId, getStoredState]
  );
  // Clear stored state
  const clearStoredSession = useCallback(() => {
    if (!isInitialized || typeof window === "undefined") return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing checkout state:", error);
    }
  }, [isInitialized]);

  // Step management
  const persistStep = useCallback(
    (step: number) => {
      storeState({ currentStep: step });
    },
    [storeState]
  );

  const getStoredStep = useCallback((): number => {
    const state = getStoredState();
    return state?.currentStep || 1;
  }, [getStoredState]);

  // Form data persistence
  const persistFormData = useCallback(
    (formData: Partial<CheckoutState>) => {
      storeState(formData);
    },
    [storeState]
  );

  const getStoredFormData = useCallback(() => {
    const state = getStoredState();
    if (!state) return {};

    return {
      shippingAddressId: state.shippingAddressId,
      billingAddressId: state.billingAddressId,
      selectedShippingOption: state.selectedShippingOption,
      paymentMethod: state.paymentMethod,
      customerPhone: state.customerPhone,
      notes: state.notes,
      specialInstructions: state.specialInstructions,
    };
  }, [getStoredState]);

  // Check if we have a valid stored session
  const hasValidSession = useCallback(() => {
    const state = getStoredState();
    return state !== null && state.sessionId === sessionId;
  }, [getStoredState, sessionId]);

  return {
    persistStep,
    getStoredStep,
    persistFormData,
    getStoredFormData,
    clearStoredSession,
    hasValidSession,
    isInitialized,
  };
}
