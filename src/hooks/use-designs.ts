// use-designs.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDesignAction,
  getDesignsAction,
  getUserDesignsAction,
  getDesignByIdAction,
  updateDesignAction,
  deleteDesignAction,
  duplicateDesignAction,
} from "@/lib/designs/designs.actions";
import {
  CreateDesignDto,
  UpdateDesignDto,
  GetDesignsDto,
  DuplicateDesignDto,
} from "@/lib/designs/dto/designs.dto";

// Query Keys
export const designsKeys = {
  all: ["designs"] as const,

  // Designs List
  list: (params?: GetDesignsDto) =>
    [...designsKeys.all, "list", params] as const,

  // User Designs List
  userList: (params?: GetDesignsDto) =>
    [...designsKeys.all, "user-list", params] as const,

  // Single Design
  detail: (id: string) => [...designsKeys.all, "detail", id] as const,
};

export function useDesignsList(params?: GetDesignsDto, enabled = true) {
  const queryParams = params || { page: 1, limit: 10 };

  return useQuery({
    queryKey: designsKeys.list(queryParams),
    queryFn: () => getDesignsAction(queryParams),
    select: (data) => (data.success ? data.data : undefined),
    enabled,
  });
}

export function useUserDesignsList(params?: GetDesignsDto, enabled = true) {
  const queryParams = params || { page: 1, limit: 10 };

  return useQuery({
    queryKey: designsKeys.userList(queryParams),
    queryFn: () => getUserDesignsAction(queryParams),
    select: (data) => (data.success ? data.data : undefined),
    enabled,
  });
}

export function useDesign(designId: string, enabled = true) {
  return useQuery({
    queryKey: designsKeys.detail(designId),
    queryFn: () => getDesignByIdAction(designId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!designId,
  });
}

export function useCreateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateDesignDto) => createDesignAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Design created successfully");
        // Invalidate both lists and user lists
        queryClient.invalidateQueries({
          queryKey: designsKeys.list(),
        });
        queryClient.invalidateQueries({
          queryKey: designsKeys.userList(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create design");
    },
  });
}

export function useUpdateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      designId,
      values,
    }: {
      designId: string;
      values: UpdateDesignDto;
    }) => updateDesignAction(designId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Design updated successfully");
        // Invalidate design detail and both lists
        queryClient.invalidateQueries({
          queryKey: designsKeys.detail(variables.designId),
        });
        queryClient.invalidateQueries({
          queryKey: designsKeys.list(),
        });
        queryClient.invalidateQueries({
          queryKey: designsKeys.userList(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update design");
    },
  });
}

export function useDeleteDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (designId: string) => deleteDesignAction(designId),
    onSuccess: (data, designId) => {
      if (data.success) {
        toast.success("Design deleted successfully");
        // Remove design detail and invalidate lists
        queryClient.removeQueries({
          queryKey: designsKeys.detail(designId),
        });
        queryClient.invalidateQueries({
          queryKey: designsKeys.list(),
        });
        queryClient.invalidateQueries({
          queryKey: designsKeys.userList(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete design");
    },
  });
}

export function useDuplicateDesign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      designId,
      values,
    }: {
      designId: string;
      values?: DuplicateDesignDto;
    }) => duplicateDesignAction(designId, values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Design duplicated successfully");
        // Invalidate both lists
        queryClient.invalidateQueries({
          queryKey: designsKeys.list(),
        });
        queryClient.invalidateQueries({
          queryKey: designsKeys.userList(),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to duplicate design");
    },
  });
}
