import { z } from "zod";
import { designApprovalStatusEnum } from "../enum/design-approval.enum";

export const requestDesignApprovalSchema = z.object({
  customerEmail: z.string().email("Invalid email address"),
  designId: z.string().min(1, "Design ID is required"),
  previewImages: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one preview image is required"),
  designSummary: z.object({
    productName: z.string().min(1, "Product name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    material: z.string().optional(),
    text: z.string().optional(),
    colors: z.array(z.string()).optional(),
    dimensions: z.string().optional(),
    printType: z.string().optional(),
    attachment: z.string().optional(),
  }),
  expiryHours: z.number().min(1).max(720).default(72), // 1 hour to 30 days
  metadata: z.record(z.any()).optional(),
});
export type RequestDesignApprovalDto = z.infer<
  typeof requestDesignApprovalSchema
>;

// Update design approval DTO (admin only)
export const updateDesignApprovalSchema = z.object({
  status: designApprovalStatusEnum,
  rejectionReason: z.string().optional(),
  approvedBy: z.string().email().optional(),
});
export type UpdateDesignApprovalDto = z.infer<
  typeof updateDesignApprovalSchema
>;

// Approve design DTO (customer facing)
export const approveDesignSchema = z.object({
  approvedBy: z.string().email("Valid email is required"),
  comments: z.string().optional(),
});
export type ApproveDesignDto = z.infer<typeof approveDesignSchema>;

// Reject design DTO (customer facing)
export const rejectDesignSchema = z.object({
  rejectedBy: z.string().email("Valid email is required"),
  rejectionReason: z.string().min(1, "Rejection reason is required"),
  requestRevision: z.boolean().default(true),
  comments: z.string().optional(),
});
export type RejectDesignDto = z.infer<typeof rejectDesignSchema>;
