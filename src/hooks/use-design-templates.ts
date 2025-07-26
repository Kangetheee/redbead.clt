"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
import {
  getTemplatesAction,
  getTemplateAction,
  getTemplateBySlugAction,
  getTemplatesByProductAction,
  createTemplateAction,
  updateTemplateAction,
  deleteTemplateAction,
  duplicateTemplateAction,
  getSizeVariantsAction,
  createSizeVariantAction,
  updateSizeVariantAction,
  deleteSizeVariantAction,
  getCustomizationOptionsAction,
  calculatePriceAction,
  getTemplateAnalyticsAction,
} from "@/lib/design-templates/design-templates.actions";
import {
  GetTemplatesDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateSizeVariantDto,
  UpdateSizeVariantDto,
  CalculatePriceDto,
  DuplicateTemplateDto,
  GetTemplatesByProductDto,
  GetTemplateAnalyticsDto,
} from "@/lib/design-templates/dto/design-template.dto";

// Query Keys
export const designTemplateKeys = {
  all: ["design-templates"] as const,
  lists: () => [...designTemplateKeys.all, "list"] as const,
  list: (params?: GetTemplatesDto) =>
    [...designTemplateKeys.lists(), params] as const,
  details: () => [...designTemplateKeys.all, "detail"] as const,
  detail: (id: string) => [...designTemplateKeys.details(), id] as const,
  bySlug: (slug: string) => [...designTemplateKeys.all, "slug", slug] as const,
  byProduct: (productId: string, params?: GetTemplatesByProductDto) =>
    [...designTemplateKeys.all, "product", productId, params] as const,
  variants: (templateId: string) =>
    [...designTemplateKeys.all, templateId, "variants"] as const,
  customizations: (templateId: string) =>
    [...designTemplateKeys.all, templateId, "customizations"] as const,
  analytics: (params?: GetTemplateAnalyticsDto) =>
    [...designTemplateKeys.all, "analytics", params] as const,
};

// Query Hooks

/**
 * Get paginated list of design templates with optional filtering
 * Uses GET /v1/templates
 */
export function useDesignTemplates(params?: GetTemplatesDto) {
  return useQuery({
    queryKey: designTemplateKeys.list(params),
    queryFn: () => getTemplatesAction(params),
    select: (response) => {
      if (!response.success) {
        return {
          success: false as const,
          error: response.error,
        };
      }
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get design template by ID
 * Uses GET /v1/templates/{id}
 */
export function useDesignTemplate(templateId: string, enabled = true) {
  return useQuery({
    queryKey: designTemplateKeys.detail(templateId),
    queryFn: () => getTemplateAction(templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get design template by slug
 * Uses GET /v1/templates/slug/{slug}
 */
export function useDesignTemplateBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: designTemplateKeys.bySlug(slug),
    queryFn: () => getTemplateBySlugAction(slug),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get all available templates for a specific product type
 * Uses GET /v1/templates/by-product/{productId}
 */
export function useDesignTemplatesByProduct(
  productId: string,
  params?: GetTemplatesByProductDto,
  enabled = true
) {
  return useQuery({
    queryKey: designTemplateKeys.byProduct(productId, params),
    queryFn: () => getTemplatesByProductAction(productId, params),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get all size variants for a template
 * Uses GET /v1/templates/{templateId}/variants
 */
export function useSizeVariants(templateId: string, enabled = true) {
  return useQuery({
    queryKey: designTemplateKeys.variants(templateId),
    queryFn: () => getSizeVariantsAction(templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Get available customization options for a template
 * Uses GET /v1/templates/{templateId}/customizations/options
 */
export function useCustomizationOptions(templateId: string, enabled = true) {
  return useQuery({
    queryKey: designTemplateKeys.customizations(templateId),
    queryFn: () => getCustomizationOptionsAction(templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!templateId,
    staleTime: 30 * 60 * 1000, // 30 minutes - customizations don't change often
  });
}

/**
 * Get performance analytics for templates
 * Uses GET /v1/templates/analytics/performance
 */
export function useTemplateAnalytics(
  params?: GetTemplateAnalyticsDto,
  enabled = true
) {
  return useQuery({
    queryKey: designTemplateKeys.analytics(params),
    queryFn: () => getTemplateAnalyticsAction(params),
    select: (data) => (data.success ? data.data : undefined),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Analytics don't need frequent updates
  });
}

// Mutation Hooks

/**
 * Create a new design template
 * Uses POST /v1/templates
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateTemplateDto) => createTemplateAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Template created successfully");

        // Invalidate templates list
        queryClient.invalidateQueries({ queryKey: designTemplateKeys.lists() });

        // Set the created template in cache
        queryClient.setQueryData(designTemplateKeys.detail(data.data.id), {
          success: true,
          data: data.data,
        });
      } else {
        toast.error(data.error || "Failed to create template");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create template");
    },
  });
}

/**
 * Update design template information and settings
 * Uses PATCH /v1/templates/{id}
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      values,
    }: {
      templateId: string;
      values: UpdateTemplateDto;
    }) => updateTemplateAction(templateId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Template updated successfully");

        // Update specific template cache
        queryClient.setQueryData(
          designTemplateKeys.detail(variables.templateId),
          { success: true, data: data.data }
        );

        // Invalidate lists to reflect changes
        queryClient.invalidateQueries({ queryKey: designTemplateKeys.lists() });
      } else {
        toast.error(data.error || "Failed to update template");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update template");
    },
  });
}

/**
 * Delete design template
 * Uses DELETE /v1/templates/{id}
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteTemplateAction(templateId),
    onSuccess: (data, templateId) => {
      if (data.success) {
        toast.success("Template deleted successfully");

        // Remove from cache
        queryClient.removeQueries({
          queryKey: designTemplateKeys.detail(templateId),
        });

        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: designTemplateKeys.lists() });
      } else {
        toast.error(data.error || "Failed to delete template");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });
}

/**
 * Create a copy of an existing template
 * Uses POST /v1/templates/{templateId}/duplicate
 */
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      values,
    }: {
      templateId: string;
      values: DuplicateTemplateDto;
    }) => duplicateTemplateAction(templateId, values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Template duplicated successfully");

        // Invalidate lists to show new template
        queryClient.invalidateQueries({ queryKey: designTemplateKeys.lists() });

        // Set duplicated template in cache
        queryClient.setQueryData(designTemplateKeys.detail(data.data.id), {
          success: true,
          data: data.data,
        });
      } else {
        toast.error(data.error || "Failed to duplicate template");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to duplicate template");
    },
  });
}

// Size Variant Mutations

/**
 * Create a new size variant for a template
 * Uses POST /v1/templates/{templateId}/variants
 */
export function useCreateSizeVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      values,
    }: {
      templateId: string;
      values: CreateSizeVariantDto;
    }) => createSizeVariantAction(templateId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Size variant created successfully");

        // Invalidate variants for this template
        queryClient.invalidateQueries({
          queryKey: designTemplateKeys.variants(variables.templateId),
        });

        // Also invalidate the template details to refresh sizeVariants array
        queryClient.invalidateQueries({
          queryKey: designTemplateKeys.detail(variables.templateId),
        });
      } else {
        toast.error(data.error || "Failed to create size variant");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create size variant");
    },
  });
}

/**
 * Update a template size variant
 * Uses PATCH /v1/templates/{templateId}/variants/{variantId}
 */
export function useUpdateSizeVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      variantId,
      values,
    }: {
      templateId: string;
      variantId: string;
      values: UpdateSizeVariantDto;
    }) => updateSizeVariantAction(templateId, variantId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Size variant updated successfully");

        // Invalidate variants for this template
        queryClient.invalidateQueries({
          queryKey: designTemplateKeys.variants(variables.templateId),
        });

        // Also invalidate the template details
        queryClient.invalidateQueries({
          queryKey: designTemplateKeys.detail(variables.templateId),
        });
      } else {
        toast.error(data.error || "Failed to update size variant");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update size variant");
    },
  });
}

/**
 * Delete a template size variant
 * Uses DELETE /v1/templates/{templateId}/variants/{variantId}
 */
export function useDeleteSizeVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      variantId,
    }: {
      templateId: string;
      variantId: string;
    }) => deleteSizeVariantAction(templateId, variantId),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Size variant deleted successfully");

        // Invalidate variants for this template
        queryClient.invalidateQueries({
          queryKey: designTemplateKeys.variants(variables.templateId),
        });

        // Also invalidate the template details
        queryClient.invalidateQueries({
          queryKey: designTemplateKeys.detail(variables.templateId),
        });
      } else {
        toast.error(data.error || "Failed to delete size variant");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete size variant");
    },
  });
}

// Pricing Mutation

/**
 * Calculate total price with customizations and quantity
 * Uses POST /v1/templates/{templateId}/calculate-price
 */
export function useCalculatePrice() {
  return useMutation({
    mutationFn: ({
      templateId,
      values,
    }: {
      templateId: string;
      values: CalculatePriceDto;
    }) => calculatePriceAction(templateId, values),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to calculate price");
    },
  });
}

// Utility Hooks

/**
 * Manual refetch hook for templates list
 */
export function useRefetchTemplates() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetTemplatesDto) => {
      queryClient.invalidateQueries({
        queryKey: params
          ? designTemplateKeys.list(params)
          : designTemplateKeys.lists(),
      });
    },
    [queryClient]
  );
}

/**
 * Get template by ID from cache (doesn't trigger network request)
 */
export function useTemplateFromCache(templateId: string) {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(designTemplateKeys.detail(templateId));
}

/**
 * Prefetch template data
 */
export function usePrefetchTemplate() {
  const queryClient = useQueryClient();

  return useCallback(
    (templateId: string) => {
      queryClient.prefetchQuery({
        queryKey: designTemplateKeys.detail(templateId),
        queryFn: () => getTemplateAction(templateId),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );
}
