import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissions: z
    .array(z.string().min(1, "Permission is required"))
    .min(1, "At least one permission is required"),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  permissions: z.array(z.string().min(1, "Permission is required")).optional(),
});

export const getRolesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type GetRolesDto = z.infer<typeof getRolesSchema>;
