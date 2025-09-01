// In useCartSessionManager.ts
"use client";

import { useCallback, useRef } from "react";
import { useMergeSessionCart } from "@/hooks/use-cart";
import { useUserProfile } from "@/hooks/use-users";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartKeys } from "@/hooks/use-cart";

const GUEST_SESSION_STORAGE_KEY = "cart-session-id";

export function useCartSessionManager() {
  const { data: userProfile, isLoading: isUserLoading } = useUserProfile();
  const mergeSessionCart = useMergeSessionCart();
  const mergeProcessedRef = useRef(false);
  const queryClient = useQueryClient();

  // Get guest session ID from localStorage or cookies
  const getGuestSessionId = useCallback(() => {
    if (typeof window === "undefined") return null;

    // First try localStorage
    const localStorageSession = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
    if (localStorageSession) {
      return localStorageSession;
    }

    // Then try cookies as fallback
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cart-session-id="))
      ?.split("=")[1];

    return cookieValue || null;
  }, []);

  // Store guest session ID in localStorage
  const storeGuestSessionId = useCallback((sessionId: string) => {
    if (typeof window !== "undefined" && sessionId) {
      localStorage.setItem(GUEST_SESSION_STORAGE_KEY, sessionId);
      console.log("Stored guest session ID:", sessionId);
    }
  }, []);

  // Clear guest session from localStorage
  const clearGuestSession = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_SESSION_STORAGE_KEY);

      // Also clear from cookies as a precaution
      document.cookie =
        "cart-session-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      console.log("Cleared guest session storage");
    }
  }, []);

  // Check and process any guest session
  const checkAndProcessSession = useCallback(() => {
    // Skip if already processed, still loading, or not authenticated
    if (mergeProcessedRef.current || isUserLoading || !userProfile?.id) {
      return;
    }

    const guestSessionId = getGuestSessionId();
    if (!guestSessionId) {
      // Mark as processed even if no session found
      mergeProcessedRef.current = true;
      return;
    }

    // Mark as processed immediately
    mergeProcessedRef.current = true;
    console.log("Auto-merging guest session:", guestSessionId);

    // Clear the session BEFORE making the request
    clearGuestSession();

    mergeSessionCart.mutate(
      { sessionId: guestSessionId },
      {
        onSuccess: (data) => {
          console.log("Merge successful:", data);

          // CRITICAL: Force a complete invalidation and refetch of cart data
          queryClient.removeQueries({ queryKey: cartKeys.all });

          // Wait for server to process the merge
          setTimeout(() => {
            queryClient.fetchQuery({ queryKey: cartKeys.list() });
          }, 500);

          if (data.mergedItemsCount > 0) {
            toast.success(
              `Welcome back! Merged ${data.mergedItemsCount} item${
                data.mergedItemsCount !== 1 ? "s" : ""
              } from your guest session`
            );
          }
        },
        onError: (error) => {
          console.error("Cart merge failed:", error);
          toast.error("Failed to merge your guest cart.");
        },
      }
    );
  }, [
    userProfile?.id,
    isUserLoading,
    getGuestSessionId,
    clearGuestSession,
    mergeSessionCart,
    queryClient,
  ]);

  // Call the check function immediately if conditions are right
  if (
    typeof window !== "undefined" &&
    !mergeProcessedRef.current &&
    !isUserLoading &&
    userProfile?.id
  ) {
    // Use setTimeout to avoid React render phase issues
    setTimeout(checkAndProcessSession, 0);
  }

  // Manual merge function for retry scenarios
  const manualMerge = useCallback(() => {
    // Only proceed if not already merging
    if (mergeSessionCart.isPending) {
      toast.info("Merge already in progress");
      return;
    }

    const guestSessionId = getGuestSessionId();
    if (guestSessionId && userProfile?.id) {
      console.log("Manual merge triggered:", guestSessionId);

      // Clear the session first
      clearGuestSession();

      mergeSessionCart.mutate(
        { sessionId: guestSessionId },
        {
          onSuccess: (data) => {
            // CRITICAL: Force cart data refresh
            queryClient.removeQueries({ queryKey: cartKeys.all });
            setTimeout(() => {
              queryClient.fetchQuery({ queryKey: cartKeys.list() });
            }, 500);

            if (data.mergedItemsCount > 0) {
              toast.success(
                `Merged ${data.mergedItemsCount} items successfully`
              );
            } else {
              toast.info("No items to merge from guest session");
            }
          },
          onError: (error) => {
            console.error("Manual merge failed:", error);
            toast.error("Failed to merge guest cart");
          },
        }
      );
    } else if (!userProfile?.id) {
      toast.error("Please log in to merge your guest cart");
    } else {
      toast.error("No guest session found to merge");
    }
  }, [
    getGuestSessionId,
    userProfile?.id,
    mergeSessionCart,
    clearGuestSession,
    queryClient,
  ]);

  return {
    storeGuestSessionId,
    getGuestSessionId,
    clearGuestSession,
    manualMerge,
    checkAndProcessSession,
    isMerging: mergeSessionCart.isPending,
    hasGuestSession: Boolean(getGuestSessionId()),
    isAuthenticated: Boolean(userProfile?.id),
  };
}
