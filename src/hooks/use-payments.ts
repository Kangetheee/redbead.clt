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
  listPaymentsAction,
  createPaymentAction,
  getPaymentSummaryAction,
  getPaymentByIdAction,
} from "@/lib/payments/payments.actions";
import {
  InitiatePaymentDto,
  RefundRequestDto,
  SqroolCallbackDto,
  ListPaymentsDto,
  CreatePaymentDto,
} from "@/lib/payments/dto/payments.dto";

export const paymentsKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentsKeys.all, "list"] as const,
  list: (filters?: Partial<ListPaymentsDto>) =>
    [...paymentsKeys.lists(), { filters }] as const,
  summary: (orderId?: string) =>
    [...paymentsKeys.all, "summary", orderId || "all"] as const,
  methods: () => [...paymentsKeys.all, "methods"] as const,
  details: (id: string) => [...paymentsKeys.all, "details", id] as const,
  byOrder: (orderId: string) =>
    [...paymentsKeys.all, "byOrder", orderId] as const,
  status: (orderId: string) =>
    [...paymentsKeys.all, "status", orderId] as const,
};

/**
 * Hook to get list of payments with pagination and filtering
 */
export function usePayments(params?: ListPaymentsDto) {
  return useQuery({
    queryKey: paymentsKeys.list(params),
    queryFn: async () => {
      const result = await listPaymentsAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new payment
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => createPaymentAction(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Payment created successfully");

        // Invalidate payments list queries
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.lists(),
        });

        // Also invalidate payment by order ID queries if applicable
        if (result.data.orderId) {
          queryClient.invalidateQueries({
            queryKey: paymentsKeys.byOrder(result.data.orderId),
          });
        }
      } else {
        toast.error(result.error || "Failed to create payment");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create payment");
    },
  });
}

/**
 * Hook to get payment summary statistics
 */
export function usePaymentSummary(orderId?: string) {
  return useQuery({
    queryKey: paymentsKeys.summary(orderId),
    queryFn: async () => {
      const result = await getPaymentSummaryAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get payment by ID
 */
export function usePayment(id: string, enabled = true) {
  return useQuery({
    queryKey: paymentsKeys.details(id),
    queryFn: async () => {
      const result = await getPaymentByIdAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!id,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get available payment methods
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentsKeys.methods(),
    queryFn: async () => {
      const result = await getPaymentMethodsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - payment methods don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get payment status for an order
 */
export function usePaymentStatus(
  orderId: string,
  enabled = true,
  pollingInterval = 5000
) {
  const query = useQuery({
    queryKey: paymentsKeys.status(orderId),
    queryFn: async () => {
      const result = await getPaymentStatusAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Auto-refresh for pending payments
  useEffect(() => {
    const status = query.data?.paymentStatus;
    const shouldPoll = status === "PENDING";

    if (shouldPoll && enabled && !!orderId && pollingInterval > 0) {
      const interval = setInterval(() => {
        query.refetch();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [
    query.data?.paymentStatus,
    query.refetch,
    enabled,
    orderId,
    pollingInterval,
  ]);

  return query;
}

/**
 * Hook to get payment details for an order
 */
export function usePaymentDetails(orderId: string, enabled = true) {
  return useQuery({
    queryKey: paymentsKeys.byOrder(orderId),
    queryFn: async () => {
      const result = await getPaymentDetailsAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
  });
}

/**
 * Hook to initiate payment for an order
 */
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

        // Show payment instructions to user if available
        if (data.data.customerMessage) {
          toast.info(data.data.customerMessage, {
            duration: 10000,
            position: "top-center",
          });
        }

        // Invalidate and start polling payment status
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.status(variables.orderId),
        });

        // Also invalidate payment details
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.byOrder(variables.orderId),
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

/**
 * Hook to initiate refund for an order
 */
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

        // Update payment-related queries
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.byOrder(variables.orderId),
        });
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.status(variables.orderId),
        });
        queryClient.invalidateQueries({
          queryKey: paymentsKeys.lists(),
        });

        // If there's a refund ID, show it
        if (data.data.refundId) {
          toast.info(`Refund reference: ${data.data.refundId}`, {
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

/**
 * Hook to handle Sqrool payment callback
 */
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

/**
 * Manual refetch hook for payment details
 */
export function useRefetchPaymentDetails() {
  const queryClient = useQueryClient();

  return useCallback(
    (orderId: string) => {
      queryClient.invalidateQueries({
        queryKey: paymentsKeys.byOrder(orderId),
      });
    },
    [queryClient]
  );
}

/**
 * Get payment method by value
 */
export function usePaymentMethodByValue(methodValue: string) {
  const { data: methods } = usePaymentMethods();

  return methods?.find((method) => method.value === methodValue);
}
