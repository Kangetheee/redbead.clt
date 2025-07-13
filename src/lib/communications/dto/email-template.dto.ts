import { z } from "zod";

export const emailTemplateCategoryEnum = z.enum([
  "DESIGN_APPROVAL_REQUEST",
  "DESIGN_APPROVED",
  "DESIGN_REJECTED",
  "ORDER_CONFIRMATION",
  "ORDER_STATUS_UPDATE",
  "SHIPPING_NOTIFICATION",
  "PAYMENT_CONFIRMATION",
  "CUSTOM",
]);

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  htmlContent: z.string().min(1, "HTML content is required"),
  textContent: z.string().optional(),
  variables: z.array(z.string()),
  category: emailTemplateCategoryEnum,
  componentName: z.string().optional(),
  previewProps: z.object({}).passthrough().optional(),
  isActive: z.boolean().default(true),
});

export const updateEmailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  subject: z.string().min(1, "Subject is required").optional(),
  htmlContent: z.string().min(1, "HTML content is required").optional(),
  textContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
  category: emailTemplateCategoryEnum.optional(),
  componentName: z.string().optional(),
  previewProps: z.object({}).passthrough().optional(),
  isActive: z.boolean().optional(),
});

export const getEmailTemplatesSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  category: emailTemplateCategoryEnum.optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isSystem: z.boolean().optional(),
});

export type CreateEmailTemplateDto = z.infer<typeof createEmailTemplateSchema>;
export type UpdateEmailTemplateDto = z.infer<typeof updateEmailTemplateSchema>;
export type GetEmailTemplatesDto = z.infer<typeof getEmailTemplatesSchema>;
export type EmailTemplateCategory = z.infer<typeof emailTemplateCategoryEnum>;
