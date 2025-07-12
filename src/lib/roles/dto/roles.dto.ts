import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Required").toLowerCase(),
  description: z.string().optional(),
  permissions: z.array(z.string().min(1, "Required")).min(1, "Required"),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
