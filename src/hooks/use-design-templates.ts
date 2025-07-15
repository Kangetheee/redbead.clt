import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDesignTemplateAction,
  getDesignTemplatesAction,
  getFeaturedDesignTemplatesAction,
  getDesignTemplateByIdAction,
  updateDesignTemplateAction,
  deleteDesignTemplateAction,
} from "@/lib/designs/design-templates.actions";
import {
  CreateDesignTemplateDto,
  UpdateDesignTemplateDto,
  GetDesignTemplatesDto,
  GetFeaturedTemplatesDto,
} from "@/lib/designs/dto/design-templates.dto";

// Query Keys
export const designTemplatesKeys = {
  all: ["design-templates"] as const,
  lists: () => [...designTemplatesKeys.all, "list"] as const,
  list: (params?: GetDesignTemplatesDto) =>
    [...designTemplatesKeys.lists(), params] as const,
  featured: (params: GetFeaturedTemplatesDto) =>
    [...designTemplatesKeys.all, "featured", params] as const,
  detail: (id: string) => [...designTemplatesKeys.all, "detail", id] as const,
};

// Hooks
export function useDesignTemplatesList(
  params?: GetDesignTemplatesDto,
  enabled = true
) {
  const queryParams = params || { page: 1, limit: 10 };

  return useQuery({
    queryKey: designTemplatesKeys.list(queryParams),
    queryFn: () => getDesignTemplatesAction(queryParams),
    select: (data) => (data.success ? data.data : undefined),
    enabled,
  });
}

export function useFeaturedDesignTemplates(
  params: GetFeaturedTemplatesDto,
  enabled = true
) {
  return useQuery({
    queryKey: designTemplatesKeys.featured(params),
    queryFn: () => getFeaturedDesignTemplatesAction(params),
    select: (data) => (data.success ? data.data : undefined),
    enabled,
  });
}

export function useDesignTemplate(templateId: string, enabled = true) {
  return useQuery({
    queryKey: designTemplatesKeys.detail(templateId),
    queryFn: () => getDesignTemplateByIdAction(templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
  });
}

export function useCreateDesignTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateDesignTemplateDto) =>
      createDesignTemplateAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Template created successfully");
        queryClient.invalidateQueries({
          queryKey: designTemplatesKeys.lists(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create template");
    },
  });
}

export function useUpdateDesignTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: UpdateDesignTemplateDto;
    }) => updateDesignTemplateAction(id, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Template updated successfully");
        queryClient.invalidateQueries({
          queryKey: designTemplatesKeys.detail(variables.id),
        });
        queryClient.invalidateQueries({
          queryKey: designTemplatesKeys.lists(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update template");
    },
  });
}

export function useDeleteDesignTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDesignTemplateAction(id),
    onSuccess: (data, id) => {
      if (data.success) {
        toast.success("Template deleted successfully");
        queryClient.removeQueries({
          queryKey: designTemplatesKeys.detail(id),
        });
        queryClient.invalidateQueries({
          queryKey: designTemplatesKeys.lists(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });
}
