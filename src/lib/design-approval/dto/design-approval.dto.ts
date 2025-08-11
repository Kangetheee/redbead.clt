import { z } from "zod";

export const rejectDesignByTokenSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

export type RejectDesignByTokenDto = z.infer<typeof rejectDesignByTokenSchema>;

// Design approval status enum
export const designApprovalStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
]);

export type DesignApprovalStatus = z.infer<typeof designApprovalStatusEnum>;

// Export the enum for use in other files
export { designApprovalStatusEnum as DESIGN_APPROVAL_STATUS };
