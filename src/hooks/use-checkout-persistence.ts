/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useCallback } from "react";

interface CheckoutSessionData {
  sessionId: string;
  timestamp: number;
  expiresAt: string;
  step?: number;
  formData?: Record<string, any>;
}

const CHECKOUT_SESSION_KEY = "checkout-session";
const CHECKOUT_FORM_KEY = "checkout-form-data";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Hook to handle checkout session persistence and recovery
 */
export function useCheckoutPersistence(sessionId?: string) {
  // Save current session ID and metadata
  useEffect(() => {
    if (sessionId && typeof window !== "undefined") {
      const sessionData: CheckoutSessionData = {
        sessionId,
        timestamp: Date.now(),
        expiresAt: new Date(Date.now() + SESSION_TIMEOUT).toISOString(),
      };

      try {
        sessionStorage.setItem(
          CHECKOUT_SESSION_KEY,
          JSON.stringify(sessionData)
        );
      } catch (error) {
        console.error("Failed to save checkout session:", error);
      }
    }
  }, [sessionId]);

  // Get stored session ID
  const getStoredSessionId = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const stored = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
      if (!stored) return null;

      const sessionData: CheckoutSessionData = JSON.parse(stored);

      // Check if session has expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
        sessionStorage.removeItem(CHECKOUT_FORM_KEY);
        return null;
      }

      return sessionData.sessionId;
    } catch (error) {
      console.error("Failed to parse stored session:", error);
      return null;
    }
  }, []);

  // Clear stored session
  const clearStoredSession = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
      sessionStorage.removeItem(CHECKOUT_FORM_KEY);
    }
  }, []);

  // Save form data
  const saveFormData = useCallback((formData: Record<string, any>) => {
    if (typeof window === "undefined") return;

    try {
      const dataToSave = {
        ...formData,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(CHECKOUT_FORM_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save form data:", error);
    }
  }, []);

  // Get stored form data
  const getStoredFormData = useCallback((): Record<string, any> | null => {
    if (typeof window === "undefined") return null;

    try {
      const stored = sessionStorage.getItem(CHECKOUT_FORM_KEY);
      if (!stored) return null;

      const formData = JSON.parse(stored);

      // Check if form data is recent (within 1 hour)
      if (Date.now() - formData.timestamp > 60 * 60 * 1000) {
        sessionStorage.removeItem(CHECKOUT_FORM_KEY);
        return null;
      }

      return formData;
    } catch (error) {
      console.error("Failed to parse stored form data:", error);
      return null;
    }
  }, []);

  // Save current step
  const saveCurrentStep = useCallback((step: number) => {
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
      if (stored) {
        const sessionData: CheckoutSessionData = JSON.parse(stored);
        sessionData.step = step;
        sessionData.timestamp = Date.now();
        sessionStorage.setItem(
          CHECKOUT_SESSION_KEY,
          JSON.stringify(sessionData)
        );
      }
    } catch (error) {
      console.error("Failed to save current step:", error);
    }
  }, []);

  // Get stored step
  const getStoredStep = useCallback((): number | null => {
    if (typeof window === "undefined") return null;

    try {
      const stored = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
      if (!stored) return null;

      const sessionData: CheckoutSessionData = JSON.parse(stored);
      return sessionData.step || null;
    } catch (error) {
      console.error("Failed to get stored step:", error);
      return null;
    }
  }, []);

  // Check if session is about to expire (within 5 minutes)
  const isSessionExpiringSoon = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    try {
      const stored = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
      if (!stored) return false;

      const sessionData: CheckoutSessionData = JSON.parse(stored);
      const timeUntilExpiry =
        new Date(sessionData.expiresAt).getTime() - Date.now();

      return timeUntilExpiry < 5 * 60 * 1000; // 5 minutes
    } catch (error) {
      console.error("Failed to check session expiry:", error);
      return false;
    }
  }, []);

  // Extend session expiry
  const extendSession = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
      if (stored) {
        const sessionData: CheckoutSessionData = JSON.parse(stored);
        sessionData.expiresAt = new Date(
          Date.now() + SESSION_TIMEOUT
        ).toISOString();
        sessionData.timestamp = Date.now();
        sessionStorage.setItem(
          CHECKOUT_SESSION_KEY,
          JSON.stringify(sessionData)
        );
      }
    } catch (error) {
      console.error("Failed to extend session:", error);
    }
  }, []);

  // Get session info
  const getSessionInfo = useCallback(() => {
    if (typeof window === "undefined") return null;

    try {
      const stored = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
      if (!stored) return null;

      const sessionData: CheckoutSessionData = JSON.parse(stored);
      const timeUntilExpiry =
        new Date(sessionData.expiresAt).getTime() - Date.now();

      return {
        sessionId: sessionData.sessionId,
        step: sessionData.step,
        expiresAt: sessionData.expiresAt,
        timeUntilExpiry,
        isExpired: timeUntilExpiry <= 0,
        isExpiringSoon: timeUntilExpiry < 5 * 60 * 1000,
      };
    } catch (error) {
      console.error("Failed to get session info:", error);
      return null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Optional: Clear session on page unload
      // This depends on your UX requirements
    };
  }, []);

  return {
    getStoredSessionId,
    clearStoredSession,
    saveFormData,
    getStoredFormData,
    saveCurrentStep,
    getStoredStep,
    isSessionExpiringSoon,
    extendSession,
    getSessionInfo,
  };
}
