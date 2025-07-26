"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  approveDesignByTokenAction,
  rejectDesignByTokenAction,
  resendApprovalEmailAction,
} from "@/lib/design-approval/design-approval.actions";
import { RejectDesignByTokenDto } from "@/lib/design-approval/dto/design-approval.dto";

// Query Keys for cache management
export const designApprovalKeys = {
  all: ["design-approval"] as const,
  approvals: () => [...designApprovalKeys.all, "approvals"] as const,
  approval: (id: string) => [...designApprovalKeys.approvals(), id] as const,
};

/**
 * Hook to approve design via email token
 * Uses GET /v1/design-approvals/approve/{token}
 */
export function useApproveDesignByToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => approveDesignByTokenAction(token),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.data.message, {
          duration: 8000,
          description: `Order ${result.data.orderNumber} will now proceed to production.`,
        });

        // Show additional success information
        toast.info("You will receive an email confirmation shortly", {
          duration: 6000,
        });

        // Invalidate any related queries
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.all,
        });
      } else {
        toast.error(result.error || "Failed to approve design");
      }
    },
    onError: (error: Error) => {
      // Handle different error types
      if (error.message.includes("404") || error.message.includes("expired")) {
        toast.error("This approval link has expired or is invalid", {
          description: "Please contact support if you need assistance.",
          duration: 10000,
        });
      } else {
        toast.error(error.message || "Failed to approve design");
      }
    },
  });
}

/**
 * Hook to reject design via email token
 * Uses GET /v1/design-approvals/reject/{token}
 */
export function useRejectDesignByToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: RejectDesignByTokenDto;
    }) => rejectDesignByTokenAction(token, data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.data.message, {
          duration: 8000,
          description: `We'll create a new design for order ${result.data.orderNumber}.`,
        });

        // Show next steps information
        toast.info(
          "You will receive a new design for approval within 1-2 business days",
          {
            duration: 10000,
          }
        );

        // Invalidate any related queries
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.all,
        });
      } else {
        toast.error(result.error || "Failed to submit design feedback");
      }
    },
    onError: (error: Error) => {
      // Handle different error types
      if (error.message.includes("404") || error.message.includes("expired")) {
        toast.error("This approval link has expired or is invalid", {
          description: "Please contact support if you need assistance.",
          duration: 10000,
        });
      } else {
        toast.error(error.message || "Failed to submit design feedback");
      }
    },
  });
}

/**
 * Hook to resend approval email (admin/staff use)
 * Uses POST /v1/design-approvals/{id}/resend
 */
export function useResendApprovalEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (approvalId: string) => resendApprovalEmailAction(approvalId),
    onSuccess: (result, approvalId) => {
      if (result.success) {
        toast.success(result.data.message, {
          description: `Email sent at ${new Date(result.data.emailSentAt).toLocaleString()}`,
          duration: 6000,
        });

        // Show reminder count if applicable
        if (result.data.remindersSent > 0) {
          toast.info(`This is reminder #${result.data.remindersSent}`, {
            duration: 5000,
          });
        }

        // Invalidate related approval queries
        queryClient.invalidateQueries({
          queryKey: designApprovalKeys.approval(approvalId),
        });
      } else {
        toast.error(result.error || "Failed to resend approval email");
      }
    },
    onError: (error: Error) => {
      // Handle different error scenarios
      if (error.message.includes("400")) {
        toast.error("Cannot resend email for completed approval", {
          description: "This design has already been approved or rejected.",
          duration: 8000,
        });
      } else if (error.message.includes("404")) {
        toast.error("Design approval not found", {
          description: "Please check the approval ID and try again.",
          duration: 6000,
        });
      } else {
        toast.error(error.message || "Failed to resend approval email");
      }
    },
  });
}

// Utility hook for managing loading states across multiple approval actions
export function useDesignApprovalLoadingState() {
  const approveDesign = useApproveDesignByToken();
  const rejectDesign = useRejectDesignByToken();
  const resendEmail = useResendApprovalEmail();

  return {
    isLoading:
      approveDesign.isPending ||
      rejectDesign.isPending ||
      resendEmail.isPending,
    isApproving: approveDesign.isPending,
    isRejecting: rejectDesign.isPending,
    isResending: resendEmail.isPending,
  };
}
