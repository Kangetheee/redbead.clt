"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPaymentMethodsAction,
  initiatePaymentAction,
  getPaymentStatusAction,
  getPaymentDetailsAction,
  initiateRefundAction,
} from "@/lib/payments/payments.actions";
import {
  InitiatePaymentDto,
  RefundRequestDto,
} from "@/lib/payments/dto/payments.dto";
import { useEffect } from "react";

// Query Keys
export const paymentsKeys = {
  all: ["payments"] as const,
  methods: () => [...paymentsKeys.all, "methods"] as const,
  status: (orderId: string) =>
    [...paymentsKeys.all, "status", orderId] as const,
  details: (orderId: string) =>
    [...paymentsKeys.all, "details", orderId] as const,
};

// Queries
export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentsKeys.methods(),
    queryFn: () => getPaymentMethodsAction(),
    select: (data) => (data.success ? data.data : undefined),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePaymentStatus(orderId: string, enabled = true) {
  const query = useQuery({
    queryKey: paymentsKeys.status(orderId),
    queryFn: () => getPaymentStatusAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: true,
  });

  // Auto-refresh for pending/processing payments
  useEffect(() => {
    const status = query.data?.status;
    const shouldPoll = status === "PENDING" || status === "PROCESSING";

    if (shouldPoll && enabled && !!orderId) {
      const interval = setInterval(() => {
        query.refetch();
      }, 5000); // 5 seconds

      return () => clearInterval(interval);
    }
  }, [query.data?.status, query.refetch, enabled, orderId]);

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

// Mutations
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

        // Show payment instructions
        if (data.data.instructions) {
          toast.info(data.data.instructions, { duration: 8000 });
        }

        // Invalidate payment status to start polling
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.status(variables.orderId),
        });

        // If it's MPESA, show additional guidance
        if (data.data.metadata?.phoneNumber) {
          toast.info("Please check your phone for the MPESA prompt", {
            duration: 10000,
          });
        }
      } else {
        toast.error(data.error);
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

        // Update payment details and status
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.details(variables.orderId),
        });
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.status(variables.orderId),
        });

        // Show refund timeline info
        toast.info("Refund will be processed within 3-5 business days", {
          duration: 8000,
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate refund");
    },
  });
}
