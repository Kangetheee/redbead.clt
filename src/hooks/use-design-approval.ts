/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  requestDesignApprovalAction,
  getDesignApprovalStatusAction,
  updateDesignApprovalAction,
  getDesignApprovalStatsAction,
  getApprovalByTokenAction,
  approveDesignByTokenAction,
  rejectDesignByTokenAction,
  getApprovalStatusByTokenAction,
  sendDesignApprovalEmailAction,
  resendApprovalEmailAction,
} from "@/lib/design-approval/design-approval.actions";
import {
  RequestDesignApprovalDto,
  UpdateDesignApprovalDto,
  ApproveDesignDto,
  RejectDesignDto,
} from "@/lib/design-approval/dto/design-approval.dto";

// Query Keys
export const designApprovalKeys = {
  all: ["design-approval"] as const,
  stats: () => [...designApprovalKeys.all, "stats"] as const,
  orders: () => [...designApprovalKeys.all, "orders"] as const,
  order: (orderId: string) =>
    [...designApprovalKeys.orders(), orderId] as const,
  tokens: () => [...designApprovalKeys.all, "tokens"] as const,
  token: (token: string) => [...designApprovalKeys.tokens(), token] as const,
  tokenStatus: (token: string) =>
    [...designApprovalKeys.token(token), "status"] as const,
};

// Admin Hooks (require authentication)

export function useDesignApprovalStats() {
  return useQuery({
    queryKey: designApprovalKeys.stats(),
    queryFn: () => getDesignApprovalStatsAction(),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useDesignApprovalStatus(orderId: string, enabled = true) {
  return useQuery({
    queryKey: designApprovalKeys.order(orderId),
    queryFn: () => getDesignApprovalStatusAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
  });
}

export function useRequestDesignApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: RequestDesignApprovalDto;
    }) => requestDesignApprovalAction(orderId, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Design approval request sent successfully");
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.order(variables.orderId),
        });
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.stats(),
        });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send design approval request");
    },
  });
}

export function useUpdateDesignApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateDesignApprovalDto;
    }) => updateDesignApprovalAction(orderId, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Design approval updated successfully");
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.order(variables.orderId),
        });
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.stats(),
        });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update design approval");
    },
  });
}

// Public Hooks (no authentication required)

export function useApprovalByToken(token: string, enabled = true) {
  return useQuery({
    queryKey: designApprovalKeys.token(token),
    queryFn: () => getApprovalByTokenAction(token),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!token,
    retry: false, // Don't retry on failure for public endpoints
  });
}

export function useApprovalStatusByToken(token: string, enabled = true) {
  return useQuery({
    queryKey: designApprovalKeys.tokenStatus(token),
    queryFn: () => getApprovalStatusByTokenAction(token),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!token,
    refetchInterval: 30000, // Refetch every 30 seconds to check for updates
    retry: false,
  });
}

export function useApproveDesignByToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: ApproveDesignDto }) =>
      approveDesignByTokenAction(token, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Design approved successfully!");
        // Invalidate both token queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.token(variables.token),
        });
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.tokenStatus(variables.token),
        });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve design");
    },
  });
}

export function useRejectDesignByToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: RejectDesignDto }) =>
      rejectDesignByTokenAction(token, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Design feedback submitted successfully");
        // Invalidate both token queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.token(variables.token),
        });
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.tokenStatus(variables.token),
        });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });
}

// Email Hooks

export function useSendDesignApprovalEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      orderId: string;
      customerEmail: string;
      customerName?: string;
      designSummary: any;
      previewImages: string[];
      expiryDays?: number;
    }) => sendDesignApprovalEmailAction(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Design approval email sent successfully");
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.order(variables.orderId),
        });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send design approval email");
    },
  });
}

export function useResendApprovalEmail() {
  return useMutation({
    mutationFn: (emailId: string) => resendApprovalEmailAction(emailId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Email resent successfully");
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend email");
    },
  });
}
