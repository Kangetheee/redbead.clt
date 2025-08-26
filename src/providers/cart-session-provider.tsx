"use client";

import { ReactNode, useEffect } from "react";
import { useCartSessionManager } from "@/hooks/useCartSessionManager";
import { useQueryClient } from "@tanstack/react-query";
import { cartKeys } from "@/hooks/use-cart";
import { useUserProfile } from "@/hooks/use-users";

interface CartSessionProviderProps {
  children: ReactNode;
}

export function CartSessionProvider({ children }: CartSessionProviderProps) {
  const { checkAndProcessSession } = useCartSessionManager();
  const { data: userProfile, isSuccess } = useUserProfile();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isSuccess && userProfile?.id) {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    }
  }, [isSuccess, userProfile?.id, queryClient]);

  if (typeof window !== "undefined") {
    setTimeout(checkAndProcessSession, 0);
  }

  return <>{children}</>;
}
