import { z } from "zod";

export const createFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export type CreateFaqDto = z.infer<typeof createFaqSchema>;

export const updateFaqSchema = createFaqSchema.partial();

export type UpdateFaqDto = z.infer<typeof updateFaqSchema>;
