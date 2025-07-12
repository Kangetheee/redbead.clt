"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { signOutAction } from "@/lib/auth/auth.actions";

export const ONE_MINUTE = 60 * 1000;

export const WARNING_TIME = 2 * ONE_MINUTE;

export const useInactivityTimer = (timeout: number) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(WARNING_TIME);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIME = useMemo(() => timeout * ONE_MINUTE, [timeout]);

  const resetTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
    setShowWarning(false);
    setTimeRemaining(WARNING_TIME);

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1000));
      }, 1000);
    }, INACTIVITY_TIME - WARNING_TIME);

    inactivityTimerRef.current = setTimeout(async () => {
      await signOutAction();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, INACTIVITY_TIME);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
      events.forEach((event) =>
        document.removeEventListener(event, resetTimer)
      );
    };
  }, [resetTimer]);

  return { showWarning, timeRemaining, resetTimer };
};
