import { z } from "zod";

export const escalationStepSchema = z.object({
  level: z.number().min(1, "Level must be at least 1"),
  delayMinutes: z.number().min(0, "Delay must be non-negative"),
  recipients: z.array(z.string()).min(1, "At least one recipient is required"),
  message: z.string().min(1, "Message is required"),
});

export const createEscalationRuleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["order_management", "quality", "inventory", "shipping"]),
  conditions: z.object({}).passthrough(),
  escalationSteps: z
    .array(escalationStepSchema)
    .min(1, "At least one escalation step is required"),
  isActive: z.boolean().default(true),
});

export const updateEscalationRuleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  category: z
    .enum(["order_management", "quality", "inventory", "shipping"])
    .optional(),
  conditions: z.object({}).passthrough().optional(),
  escalationSteps: z.array(escalationStepSchema).optional(),
  isActive: z.boolean().optional(),
});

export type CreateEscalationRuleDto = z.infer<
  typeof createEscalationRuleSchema
>;
export type UpdateEscalationRuleDto = z.infer<
  typeof updateEscalationRuleSchema
>;
export type EscalationStepDto = z.infer<typeof escalationStepSchema>;
