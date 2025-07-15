import { z } from "zod";

export const generateNotesRequestSchema = z.object({
  context: z.object({}).describe("Context data for note generation"),
  trigger: z.string().min(1, "Trigger is required"),
  ruleIds: z.array(z.string()).optional(),
});

export type GenerateNotesRequestDto = z.infer<
  typeof generateNotesRequestSchema
>;

export const createNotificationTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(255, "Name too long"),
  category: z.enum([
    "order_management",
    "inventory",
    "production",
    "quality",
    "shipping",
  ]),
  channel: z.enum(["email", "sms", "push", "webhook"]),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(255, "Subject too long"),
  content: z.string().min(1, "Content is required"),
  variables: z.array(z.string()).default([]),
  recipients: z.array(z.string()).min(1, "At least one recipient is required"),
  conditions: z.object({}).optional(),
  isActive: z.boolean().default(true),
});

export type CreateNotificationTemplateDto = z.infer<
  typeof createNotificationTemplateSchema
>;

export const updateNotificationTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(255, "Name too long")
    .optional(),
  category: z
    .enum([
      "order_management",
      "inventory",
      "production",
      "quality",
      "shipping",
    ])
    .optional(),
  channel: z.enum(["email", "sms", "push", "webhook"]).optional(),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(255, "Subject too long")
    .optional(),
  content: z.string().min(1, "Content is required").optional(),
  variables: z.array(z.string()).optional(),
  recipients: z.array(z.string()).optional(),
  conditions: z.object({}).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateNotificationTemplateDto = z.infer<
  typeof updateNotificationTemplateSchema
>;

export const sendTeamAlertSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message too long"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  recipients: z.array(z.string()).min(1, "At least one recipient is required"),
  channel: z.enum(["email", "sms", "push"]).default("email"),
  metadata: z.object({}).optional(),
});

export type SendTeamAlertDto = z.infer<typeof sendTeamAlertSchema>;

export const escalationStepSchema = z.object({
  level: z.number().min(1, "Level must be at least 1"),
  delayMinutes: z.number().min(0, "Delay cannot be negative"),
  recipients: z.array(z.string()).min(1, "At least one recipient is required"),
  message: z.string().min(1, "Message is required"),
});

export const createEscalationRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(255, "Name too long"),
  category: z.enum(["order_management", "quality", "inventory", "shipping"]),
  conditions: z.object({}),
  escalationSteps: z
    .array(escalationStepSchema)
    .min(1, "At least one escalation step is required"),
  isActive: z.boolean().default(true),
});

export type CreateEscalationRuleDto = z.infer<
  typeof createEscalationRuleSchema
>;

export const updateEscalationRuleSchema = z.object({
  name: z
    .string()
    .min(1, "Rule name is required")
    .max(255, "Name too long")
    .optional(),
  category: z
    .enum(["order_management", "quality", "inventory", "shipping"])
    .optional(),
  conditions: z.object({}).optional(),
  escalationSteps: z.array(escalationStepSchema).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateEscalationRuleDto = z.infer<
  typeof updateEscalationRuleSchema
>;

export const getTemplatesSchema = z.object({
  category: z.string().optional(),
  channel: z.string().optional(),
});

export type GetTemplatesDto = z.infer<typeof getTemplatesSchema>;

export const getEscalationRulesSchema = z.object({
  category: z.string().optional(),
});

export type GetEscalationRulesDto = z.infer<typeof getEscalationRulesSchema>;
