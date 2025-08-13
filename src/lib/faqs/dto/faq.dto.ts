import { z } from "zod";

export const createFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export type CreateFaqDto = z.infer<typeof createFaqSchema>;
