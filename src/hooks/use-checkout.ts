"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  initializeCheckoutAction,
  calculateShippingAction,
  validateCheckoutAction,
  completeCheckoutAction,
  getCheckoutSessionAction,
  getOrderConfirmationAction,
  listCheckoutSessionsAction,
} from "@/lib/checkout/checkout.actions";
import {
  InitCheckoutDto,
  ShippingCalculationDto,
  ValidateCheckoutDto,
  CompleteCheckoutDto,
  ListCheckoutSessionsDto,
} from "@/lib/checkout/dto/checkout.dto";

export const checkoutKeys = {
  all: ["checkout"] as const,
  sessions: (filters?: Partial<ListCheckoutSessionsDto>) =>
    [...checkoutKeys.all, "sessions", filters] as const,
  session: (sessionId: string) =>
    [...checkoutKeys.all, "session", sessionId] as const,
  confirmation: (orderId: string) =>
    [...checkoutKeys.all, "confirmation", orderId] as const,
};


export function useCheckoutSession(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: checkoutKeys.session(sessionId),
    queryFn: async () => {
      const result = await getCheckoutSessionAction(sessionId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!sessionId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOrderConfirmation(orderId: string, enabled = true) {
  return useQuery({
    queryKey: checkoutKeys.confirmation(orderId),
    queryFn: async () => {
      const result = await getOrderConfirmationAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

export function useCheckoutSessions(
  params: ListCheckoutSessionsDto = { pageIndex: 0, pageSize: 10 }
) {
  return useQuery({
    queryKey: checkoutKeys.sessions(params),
    queryFn: async () => {
      const result = await listCheckoutSessionsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchOnWindowFocus: false,
  });
}

export function useInitializeCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: InitCheckoutDto) => {
      const result = await initializeCheckoutAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Checkout initialized successfully");
      // Cache the session data
      queryClient.setQueryData(checkoutKeys.session(data.sessionId), data);
    },
    onError: (error) => {
      toast.error(`Failed to initialize checkout: ${error.message}`);
    },
  });
}

export function useCalculateShipping() {
  return useMutation({
    mutationFn: async (values: ShippingCalculationDto) => {
      const result = await calculateShippingAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Shipping options calculated");
    },
    onError: (error) => {
      toast.error(`Failed to calculate shipping: ${error.message}`);
    },
  });
}

export function useValidateCheckout() {
  return useMutation({
    mutationFn: async (values: ValidateCheckoutDto) => {
      const result = await validateCheckoutAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      if (data.isValid) {
        toast.success("Checkout validation passed");
      } else {
        // Show validation errors
        data.errors.forEach((error) => toast.error(error));
        data.warnings.forEach((warning) => toast.warning(warning));
      }
    },
    onError: (error) => {
      toast.error(`Failed to validate checkout: ${error.message}`);
    },
  });
}

// validate that we are creating order at this point
export function useCompleteCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CompleteCheckoutDto) => {
      const result = await completeCheckoutAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Order placed successfully!");

      // Clear checkout session from cache
      queryClient.removeQueries({
        queryKey: checkoutKeys.session(variables.sessionId),
      });

      // Cache the order confirmation data
      const confirmationData = {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        status: "PENDING",
        totalAmount: data.totalAmount,
        paymentStatus: data.paymentRequired ? "PENDING" : "COMPLETED",
        nextSteps: data.nextSteps,
        estimatedDelivery: data.estimatedDelivery,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        checkoutKeys.confirmation(data.orderId),
        confirmationData
      );

      // Invalidate cart data since items were used for order
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(`Failed to complete checkout: ${error.message}`);
    },
  });
}

export function useSessionTimeRemaining(sessionId: string) {
  const { data: session } = useCheckoutSession(sessionId);

  if (!session?.expiresAt) return null;

  const expiryTime = new Date(session.expiresAt).getTime();
  const currentTime = Date.now();
  const timeRemaining = Math.max(0, expiryTime - currentTime);

  return Math.floor(timeRemaining / (1000 * 60)); // Return minutes
}

export function useSessionExpired(sessionId: string) {
  const { data: session } = useCheckoutSession(sessionId);

  if (!session?.expiresAt) return false;

  return new Date(session.expiresAt) < new Date();
}
