"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useCallback } from "react";
import {
  getPaymentMethodsAction,
  initiatePaymentAction,
  getPaymentStatusAction,
  getPaymentDetailsAction,
  initiateRefundAction,
  handleSqroolCallbackAction,
} from "@/lib/payments/payments.actions";
import {
  InitiatePaymentDto,
  RefundRequestDto,
  SqroolCallbackDto,
} from "@/lib/payments/dto/payments.dto";

export const paymentsKeys = {
  all: ["payments"] as const,
  methods: () => [...paymentsKeys.all, "methods"] as const,
  status: (orderId: string) =>
    [...paymentsKeys.all, "status", orderId] as const,
  details: (orderId: string) =>
    [...paymentsKeys.all, "details", orderId] as const,
};

export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentsKeys.methods(),
    queryFn: () => getPaymentMethodsAction(),
    select: (data) => (data.success ? data.data : undefined),
    staleTime: 10 * 60 * 1000, // 10 minutes - payment methods don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function usePaymentStatus(
  orderId: string,
  enabled = true,
  pollingInterval = 5000
) {
  const query = useQuery({
    queryKey: paymentsKeys.status(orderId),
    queryFn: () => getPaymentStatusAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Auto-refresh for pending/processing payments
  useEffect(() => {
    const status = query.data?.status;
    const shouldPoll = status === "PENDING" || status === "PROCESSING";

    if (shouldPoll && enabled && !!orderId && pollingInterval > 0) {
      const interval = setInterval(() => {
        query.refetch();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [query.data?.status, query.refetch, enabled, orderId, pollingInterval]);

  return query;
}

export function usePaymentDetails(orderId: string, enabled = true) {
  return useQuery({
    queryKey: paymentsKeys.details(orderId),
    queryFn: () => getPaymentDetailsAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values?: InitiatePaymentDto;
    }) => initiatePaymentAction(orderId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Payment initiated successfully");

        // Show payment instructions to user
        if (data.data.instructions) {
          toast.info(data.data.instructions, {
            duration: 10000,
            position: "top-center",
          });
        }

        // Show additional guidance based on payment method
        if (data.data.metadata?.phoneNumber) {
          toast.info("Please check your phone for the MPESA prompt", {
            duration: 15000,
            position: "top-center",
          });
        }

        // Show next steps if available
        if (data.data.nextSteps && data.data.nextSteps.length > 0) {
          const steps = data.data.nextSteps.join(" • ");
          toast.info(`Next steps: ${steps}`, {
            duration: 12000,
            position: "top-center",
          });
        }

        // Invalidate and start polling payment status
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.status(variables.orderId),
        });

        // Also invalidate payment details
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.details(variables.orderId),
        });
      } else {
        toast.error(data.error || "Failed to initiate payment");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate payment");
    },
  });
}

export function useInitiateRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values: RefundRequestDto;
    }) => initiateRefundAction(orderId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Refund initiated successfully");

        // Show refund timeline information
        if (data.data.estimatedCompletionTime) {
          toast.info(
            `Refund expected by: ${data.data.estimatedCompletionTime}`,
            {
              duration: 8000,
            }
          );
        } else {
          toast.info("Refund will be processed within 3-5 business days", {
            duration: 8000,
          });
        }

        // Update payment-related queries
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.details(variables.orderId),
        });
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.status(variables.orderId),
        });

        // If there's a refund reference, show it
        if (data.data.reference) {
          toast.info(`Refund reference: ${data.data.reference}`, {
            duration: 10000,
          });
        }
      } else {
        toast.error(data.error || "Failed to initiate refund");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate refund");
    },
  });
}

export function useHandleSqroolCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callbackData: SqroolCallbackDto) =>
      handleSqroolCallbackAction(callbackData),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate all payment-related queries to refresh data
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.all,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Failed to process Sqrool callback:", error);
    },
  });
}

/**
 * Manual refetch hook for payment status
 */
export function useRefetchPaymentStatus() {
  const queryClient = useQueryClient();

  return useCallback(
    (orderId: string) => {
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.status(orderId),
      });
    },
    [queryClient]
  );
}

export function useRefetchPaymentDetails() {
  const queryClient = useQueryClient();

  return useCallback(
    (orderId: string) => {
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.details(orderId),
      });
    },
    [queryClient]
  );
}

/**
 * Get payment method by type
 */
export function usePaymentMethodByType(methodType: string) {
  const { data: methods } = usePaymentMethods();

  return methods?.find((method) => method.type === methodType);
}
