"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook that returns a boolean indicating whether
 * the current viewport matches the provided media query
 *
 * @param query Media query string (e.g. "(min-width: 768px)")
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with null and update after mount to avoid hydration mismatch
  const [matches, setMatches] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    // Create media query list
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Define listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener("change", listener);

    // Remove listener on cleanup
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  // Return false during SSR to avoid hydration mismatch
  return mounted ? matches : false;
}
