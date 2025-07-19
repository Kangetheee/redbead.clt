import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutSession } from "@/hooks/use-checkout";
import { useCheckoutPersistence } from "@/hooks/use-checkout-persistence";
import { toast } from "sonner";

interface UseCheckoutSessionManagementOptions {
  sessionId: string;
  onSessionExpired?: () => void;
  onSessionInvalid?: () => void;
  warningTimeMinutes?: number;
}

export function useCheckoutSessionManagement({
  sessionId,
  onSessionExpired,
  onSessionInvalid,
  warningTimeMinutes = 10,
}: UseCheckoutSessionManagementOptions) {
  const router = useRouter();
  const { clearStoredSession } = useCheckoutPersistence(sessionId);
  const { data: session, error } = useCheckoutSession(sessionId, !!sessionId);

  const warningShownRef = useRef(false);
  const expiredHandledRef = useRef(false);

  // Handle session expiry warnings and cleanup
  useEffect(() => {
    if (!session) return;

    const checkExpiry = () => {
      const now = Date.now();
      const expiryTime = new Date(session.expiresAt).getTime();
      const timeUntilExpiry = expiryTime - now;
      const warningThreshold = warningTimeMinutes * 60 * 1000;

      // Show warning when approaching expiry
      if (
        timeUntilExpiry <= warningThreshold &&
        timeUntilExpiry > 0 &&
        !warningShownRef.current
      ) {
        warningShownRef.current = true;
        toast.warning(
          `Your checkout session will expire in ${Math.ceil(timeUntilExpiry / 60000)} minutes. Please complete your order soon.`,
          { duration: 10000 }
        );
      }

      // Handle expiry
      if (timeUntilExpiry <= 0 && !expiredHandledRef.current) {
        expiredHandledRef.current = true;
        clearStoredSession();

        toast.error("Your checkout session has expired. Please start over.");

        if (onSessionExpired) {
          onSessionExpired();
        } else {
          router.push("/dashboard/customer/cart");
        }
      }
    };

    // Check immediately
    checkExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiry, 60000);

    return () => clearInterval(interval);
  }, [
    session,
    clearStoredSession,
    onSessionExpired,
    router,
    warningTimeMinutes,
  ]);

  // Handle session errors
  useEffect(() => {
    if (error && !expiredHandledRef.current) {
      expiredHandledRef.current = true;
      clearStoredSession();

      toast.error("Unable to load checkout session. Please start over.");

      if (onSessionInvalid) {
        onSessionInvalid();
      } else {
        router.push("/dashboard/customer/cart");
      }
    }
  }, [error, clearStoredSession, onSessionInvalid, router]);

  return {
    session,
    isExpired: session ? new Date(session.expiresAt) < new Date() : false,
    timeUntilExpiry: session
      ? new Date(session.expiresAt).getTime() - Date.now()
      : 0,
    error,
  };
}
