import { z } from "zod";

// Email template categories
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

export type EmailTemplateCategory = z.infer<typeof emailTemplateCategoryEnum>;

// Email status enum
export const emailStatusEnum = z.enum([
  "PENDING",
  "QUEUED",
  "SENT",
  "DELIVERED",
  "OPENED",
  "CLICKED",
  "BOUNCED",
  "FAILED",
  "SPAM",
]);

export type EmailStatus = z.infer<typeof emailStatusEnum>;

// Email priority enum
export const emailPriorityEnum = z.enum(["high", "normal", "low"]);
export type EmailPriority = z.infer<typeof emailPriorityEnum>;

// Device type enum
export const deviceTypeEnum = z.enum(["desktop", "mobile", "tablet"]);
export type DeviceType = z.infer<typeof deviceTypeEnum>;

// Sort order enum
export const sortOrderEnum = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof sortOrderEnum>;

// Send single email schema - POST /v1/emails/send
export const sendEmailSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  recipientEmail: z.string().email("Invalid email address"),
  recipientName: z.string().optional(),
  variables: z.record(z.any()).optional(),
  orderId: z.string().optional(),
  priority: emailPriorityEnum.optional(),
  headers: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});

export type SendEmailDto = z.infer<typeof sendEmailSchema>;

// Send design approval email schema - POST /v1/emails/send-design-approval
export const sendDesignApprovalEmailSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerName: z.string().optional(),
  designSummary: z.record(z.any()),
  previewImages: z.array(z.string()),
  expiryDays: z.number().min(1).default(7),
});

export type SendDesignApprovalEmailDto = z.infer<
  typeof sendDesignApprovalEmailSchema
>;

// Email templates list schema - GET /v1/emails/templates
export const getEmailTemplatesSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  category: emailTemplateCategoryEnum.optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isSystem: z.boolean().optional(),
});

export type GetEmailTemplatesDto = z.infer<typeof getEmailTemplatesSchema>;

// Create email template schema - POST /v1/emails/templates
export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  htmlContent: z.string().min(1, "HTML content is required"),
  textContent: z.string().optional(),
  variables: z.array(z.string()),
  category: emailTemplateCategoryEnum,
  componentName: z.string().optional(),
  previewProps: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export type CreateEmailTemplateDto = z.infer<typeof createEmailTemplateSchema>;

// Update email template schema - PATCH /v1/emails/templates/{id}
export const updateEmailTemplateSchema = createEmailTemplateSchema.partial();

export type UpdateEmailTemplateDto = z.infer<typeof updateEmailTemplateSchema>;

// Preview email template schema - POST /v1/emails/templates/preview
export const previewEmailTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  variables: z.record(z.any()).optional(),
  deviceType: deviceTypeEnum.default("desktop"),
});

export type PreviewEmailTemplateDto = z.infer<
  typeof previewEmailTemplateSchema
>;

// Email logs query schema - GET /v1/emails/logs
export const getEmailLogsSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  status: emailStatusEnum.optional(),
  recipientEmail: z.string().email().optional(),
  orderId: z.string().optional(),
  templateId: z.string().optional(),
  dateFrom: z.string().optional(), // ISO string
  dateTo: z.string().optional(), // ISO string
  sortBy: z.string().default("createdAt").optional(),
  sortOrder: sortOrderEnum.default("desc").optional(),
});

export type GetEmailLogsDto = z.infer<typeof getEmailLogsSchema>;

// Send test email schema - POST /v1/emails/test
export const sendTestEmailSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  testEmail: z.string().email("Invalid test email address"),
  useSampleData: z.boolean().default(true),
  variables: z.record(z.any()).optional(),
});

export type SendTestEmailDto = z.infer<typeof sendTestEmailSchema>;

// Email webhook schema - POST /v1/emails/webhooks
export const emailWebhookSchema = z.object({
  event: z.string().min(1, "Event is required"),
  messageId: z.string().min(1, "Message ID is required"),
  email: z.string().email("Invalid email address"),
  timestamp: z.number(),
  data: z.record(z.any()).optional(),
  summary: z.string().optional(),
  subject: z.string().optional(),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
});

export type EmailWebhookDto = z.infer<typeof emailWebhookSchema>;
