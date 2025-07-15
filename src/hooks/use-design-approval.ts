"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApprovalDetailsAction,
  approveDesignAction,
  rejectDesignAction,
  getApprovalStatusAction,
} from "@/lib/design-approval/design-approval.actions";
import {
  ApproveDesignDto,
  RejectDesignDto,
} from "@/lib/design-approval/dto/design-approval.dto";

// Query Keys
export const designApprovalKeys = {
  all: ["design-approval"] as const,
  details: (token: string) =>
    [...designApprovalKeys.all, "details", token] as const,
  status: (token: string) =>
    [...designApprovalKeys.all, "status", token] as const,
};

// Queries
export function useApprovalDetails(token: string, enabled = true) {
  return useQuery({
    queryKey: designApprovalKeys.details(token),
    queryFn: () => getApprovalDetailsAction(token),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!token,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useApprovalStatus(token: string, enabled = true) {
  return useQuery({
    queryKey: designApprovalKeys.status(token),
    queryFn: () => getApprovalStatusAction(token),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!token,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds to update time remaining
    refetchOnWindowFocus: true,
  });
}

// Mutations
export function useApproveDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      values,
    }: {
      token: string;
      values: ApproveDesignDto;
    }) => approveDesignAction(token, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success(
          "Design approved successfully! Production will begin shortly."
        );

        // Update the approval details cache
        queryClient.setQueryData(designApprovalKeys.details(variables.token), {
          success: true,
          data: data.data,
        });

        // Update the status cache
        queryClient.setQueryData(designApprovalKeys.status(variables.token), {
          success: true,
          data: {
            status: "APPROVED",
            isExpired: false,
            canApprove: false,
            canReject: false,
            message: data.data.message,
          },
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve design");
    },
  });
}

export function useRejectDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      values,
    }: {
      token: string;
      values: RejectDesignDto;
    }) => rejectDesignAction(token, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        const message = data.data.requestRevision
          ? "Design rejected. Our team will contact you about the revision."
          : "Design rejected and order processing stopped.";

        toast.success(message);

        // Update the approval details cache
        queryClient.setQueryData(designApprovalKeys.details(variables.token), {
          success: true,
          data: data.data,
        });

        // Update the status cache
        queryClient.setQueryData(designApprovalKeys.status(variables.token), {
          success: true,
          data: {
            status: "REJECTED",
            isExpired: false,
            canApprove: false,
            canReject: false,
            message: data.data.message,
          },
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject design");
    },
  });
}
