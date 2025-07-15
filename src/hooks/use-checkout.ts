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
} from "@/lib/checkout/checkout.actions";
import {
  InitCheckoutDto,
  ShippingCalculationDto,
  ValidateCheckoutDto,
  CompleteCheckoutDto,
} from "@/lib/checkout/dto/checkout.dto";

// Query Keys
export const checkoutKeys = {
  all: ["checkout"] as const,
  session: (sessionId: string) =>
    [...checkoutKeys.all, "session", sessionId] as const,
  confirmation: (orderId: string) =>
    [...checkoutKeys.all, "confirmation", orderId] as const,
};

// Queries
export function useCheckoutSession(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: checkoutKeys.session(sessionId),
    queryFn: () => getCheckoutSessionAction(sessionId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!sessionId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOrderConfirmation(orderId: string, enabled = true) {
  return useQuery({
    queryKey: checkoutKeys.confirmation(orderId),
    queryFn: () => getOrderConfirmationAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

// Mutations
export function useInitializeCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InitCheckoutDto) => initializeCheckoutAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Checkout initialized successfully");
        // Cache the session data
        queryClient.setQueryData(checkoutKeys.session(data.data.sessionId), {
          success: true,
          data: data.data,
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initialize checkout");
    },
  });
}

export function useCalculateShipping() {
  return useMutation({
    mutationFn: (values: ShippingCalculationDto) =>
      calculateShippingAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Shipping options calculated");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to calculate shipping");
    },
  });
}

export function useValidateCheckout() {
  return useMutation({
    mutationFn: (values: ValidateCheckoutDto) => validateCheckoutAction(values),
    onSuccess: (data) => {
      if (data.success) {
        if (data.data.isValid) {
          toast.success("Checkout validation passed");
        } else {
          // Show validation errors
          data.data.errors.forEach((error) => toast.error(error));
          data.data.warnings.forEach((warning) => toast.warning(warning));
        }
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to validate checkout");
    },
  });
}

export function useCompleteCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CompleteCheckoutDto) => completeCheckoutAction(values),
    onSuccess: (data, variables) => {
      // Add 'variables' parameter to access original input
      if (data.success) {
        toast.success("Order placed successfully!");

        // Clear checkout session from cache using the original sessionId
        queryClient.removeQueries({
          queryKey: checkoutKeys.session(variables.sessionId),
        });

        // Cache the order confirmation
        queryClient.setQueryData(checkoutKeys.confirmation(data.data.orderId), {
          success: true,
          data: {
            orderId: data.data.orderId,
            orderNumber: data.data.orderNumber,
            status: "PENDING",
            totalAmount: data.data.totalAmount,
            paymentStatus: data.data.paymentRequired ? "PENDING" : "COMPLETED",
            nextSteps: data.data.nextSteps,
            estimatedDelivery: data.data.estimatedDelivery,
            createdAt: new Date().toISOString(),
          },
        });

        // Invalidate cart data since items were used for order
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete checkout");
    },
  });
}
