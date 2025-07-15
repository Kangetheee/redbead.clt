import { z } from "zod";

export const approveDesignSchema = z.object({
  approvedBy: z.string().email("Invalid email address"),
  comments: z.string().max(1000, "Comments too long").optional(),
});

export type ApproveDesignDto = z.infer<typeof approveDesignSchema>;

export const rejectDesignSchema = z.object({
  rejectedBy: z.string().email("Invalid email address"),
  rejectionReason: z
    .string()
    .min(1, "Rejection reason is required")
    .max(1000, "Reason too long"),
  requestRevision: z.boolean().default(true),
});

export type RejectDesignDto = z.infer<typeof rejectDesignSchema>;
