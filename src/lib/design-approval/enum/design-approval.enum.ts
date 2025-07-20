import { z } from "zod";

export const designApprovalStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
]);
export type DesignApprovalStatus = z.infer<typeof designApprovalStatusEnum>;
