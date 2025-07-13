import { z } from "zod";

// This would be for category-specific validation if needed
export const optionCategorySchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  optionIds: z.array(z.string().uuid("Invalid option ID")),
});

export type OptionCategoryDto = z.infer<typeof optionCategorySchema>;
