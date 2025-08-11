import { z } from "zod";

export const designApprovalStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
]);
export type DesignApprovalStatus = z.infer<typeof designApprovalStatusEnum>;
