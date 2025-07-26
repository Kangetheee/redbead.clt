import { z } from "zod";

export const previewEmailTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  variables: z.object({}).passthrough(),
  deviceType: z.enum(["desktop", "mobile", "tablet"]).default("desktop"),
});

export type PreviewEmailTemplateDto = z.infer<
  typeof previewEmailTemplateSchema
>;
