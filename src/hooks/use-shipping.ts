/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
import {
  getShippingZonesAction,
  getShippingZoneByIdAction,
  createShippingZoneAction,
  updateShippingZoneAction,
  deleteShippingZoneAction,
  getShippingRatesByZoneAction,
  getShippingRateByIdAction,
  createShippingRateAction,
  updateShippingRateAction,
  deleteShippingRateAction,
  calculateShippingAction,
} from "@/lib/shipping/shipping.actions";
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
  CalculateShippingDto,
  GetShippingZonesDto,
  GetShippingRatesDto,
} from "@/lib/shipping/dto/shipping.dto";

// Query Keys
export const shippingKeys = {
  all: ["shipping"] as const,
  zones: () => [...shippingKeys.all, "zones"] as const,
  zonesList: (params?: GetShippingZonesDto) =>
    [...shippingKeys.zones(), "list", params] as const,
  zoneDetail: (id: string) => [...shippingKeys.zones(), "detail", id] as const,
  rates: () => [...shippingKeys.all, "rates"] as const,
  rateDetail: (id: string) => [...shippingKeys.rates(), "detail", id] as const,
  zoneRates: (zoneId: string, params?: GetShippingRatesDto) =>
    [...shippingKeys.all, "zones", zoneId, "rates", params] as const,
  calculation: (params: CalculateShippingDto) =>
    [...shippingKeys.all, "calculation", params] as const,
};

// Zone Query Hooks

/**
 * Get paginated list of shipping zones
 * Uses GET /v1/shipping/zones
 */
export function useShippingZones(params?: GetShippingZonesDto) {
  return useQuery({
    queryKey: shippingKeys.zonesList(params),
    queryFn: () => getShippingZonesAction(params),
    select: (response) => {
      if (!response.success) {
        return {
          success: false as const,
          error: response.error,
        };
      }
      return response;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - zones don't change often
  });
}

/**
 * Get shipping zone by ID
 * Uses GET /v1/shipping/zones/{id}
 */
export function useShippingZone(zoneId: string, enabled = true) {
  return useQuery({
    queryKey: shippingKeys.zoneDetail(zoneId),
    queryFn: () => getShippingZoneByIdAction(zoneId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!zoneId,
    staleTime: 15 * 60 * 1000,
  });
}

// Rate Query Hooks

/**
 * Get shipping rates for a specific zone
 * Uses GET /v1/shipping/zones/{id}/rates
 */
export function useZoneRates(
  zoneId: string,
  params?: GetShippingRatesDto,
  enabled = true
) {
  return useQuery({
    queryKey: shippingKeys.zoneRates(zoneId, params),
    queryFn: () => getShippingRatesByZoneAction(zoneId, params),
    select: (response) => {
      if (!response.success) {
        return {
          success: false as const,
          error: response.error,
        };
      }
      return response;
    },
    enabled: enabled && !!zoneId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Get shipping rate by ID
 * Uses GET /v1/shipping/rates/{id}
 */
export function useShippingRate(rateId: string, enabled = true) {
  return useQuery({
    queryKey: shippingKeys.rateDetail(rateId),
    queryFn: () => getShippingRateByIdAction(rateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!rateId,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Calculate shipping options for a destination (query version)
 * Uses POST /v1/shipping/calculate
 */
export function useShippingCalculation(
  params: CalculateShippingDto,
  enabled = true
) {
  return useQuery({
    queryKey: shippingKeys.calculation(params),
    queryFn: () => calculateShippingAction(params),
    select: (response) => {
      if (!response.success) {
        return {
          success: false as const,
          error: response.error,
        };
      }
      return response;
    },
    enabled: enabled && !!params.shippingAddress.country && !!params.sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes - calculations can be cached briefly
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (no shipping options available)
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Zone Mutation Hooks

/**
 * Create a new shipping zone
 * Uses POST /v1/shipping/zones
 */
export function useCreateShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateShippingZoneDto) =>
      createShippingZoneAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Shipping zone created successfully");

        // Invalidate zones list
        queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });

        // Set the created zone in cache
        queryClient.setQueryData(shippingKeys.zoneDetail(data.data.id), {
          success: true,
          data: data.data,
        });

        toast.info(
          `Zone "${data.data.name}" created with ${data.data.countries.length} countries`,
          { duration: 6000 }
        );
      } else {
        toast.error(data.error || "Failed to create shipping zone");
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("400")) {
        toast.error(
          "Invalid zone data or countries already assigned to another zone",
          {
            description:
              "Please check that all countries are valid and not already in use.",
            duration: 8000,
          }
        );
      } else {
        toast.error(error.message || "Failed to create shipping zone");
      }
    },
  });
}

/**
 * Update an existing shipping zone
 * Uses PUT /v1/shipping/zones/{id}
 */
export function useUpdateShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      values,
    }: {
      zoneId: string;
      values: UpdateShippingZoneDto;
    }) => updateShippingZoneAction(zoneId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Shipping zone updated successfully");

        // Update specific zone cache
        queryClient.setQueryData(shippingKeys.zoneDetail(variables.zoneId), {
          success: true,
          data: data.data,
        });

        // Invalidate zones list
        queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });
      } else {
        toast.error(data.error || "Failed to update shipping zone");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shipping zone");
    },
  });
}

/**
 * Delete a shipping zone
 * Uses DELETE /v1/shipping/zones/{id}
 */
export function useDeleteShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteShippingZoneAction(zoneId),
    onSuccess: (data, zoneId) => {
      if (data.success) {
        toast.success("Shipping zone deleted successfully");

        // Remove from cache
        queryClient.removeQueries({
          queryKey: shippingKeys.zoneDetail(zoneId),
        });

        // Invalidate zones list
        queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });

        // Also invalidate zone rates
        queryClient.invalidateQueries({
          queryKey: [...shippingKeys.all, "zones", zoneId, "rates"],
        });
      } else {
        toast.error(data.error || "Failed to delete shipping zone");
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("400")) {
        toast.error("Cannot delete zone with existing shipping rates", {
          description: "Please remove all rates from this zone first.",
          duration: 8000,
        });
      } else {
        toast.error(error.message || "Failed to delete shipping zone");
      }
    },
  });
}

// Rate Mutation Hooks

/**
 * Create a new shipping rate for a zone
 * Uses POST /v1/shipping/zones/{id}/rates
 */
export function useCreateShippingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      values,
    }: {
      zoneId: string;
      values: CreateShippingRateDto;
    }) => createShippingRateAction(zoneId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Shipping rate created successfully");

        // Invalidate rates for this zone
        queryClient.invalidateQueries({
          queryKey: [...shippingKeys.all, "zones", variables.zoneId, "rates"],
        });

        // Set the created rate in cache
        queryClient.setQueryData(shippingKeys.rateDetail(data.data.id), {
          success: true,
          data: data.data,
        });

        const freeShipping = data.data.freeShippingThreshold
          ? ` (Free shipping over $${data.data.freeShippingThreshold})`
          : "";
        toast.info(
          `"${data.data.name}" created - $${data.data.baseRate} base rate${freeShipping}`,
          { duration: 6000 }
        );
      } else {
        toast.error(data.error || "Failed to create shipping rate");
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("400")) {
        toast.error("Invalid rate data", {
          description: "Please check all rate parameters and try again.",
          duration: 6000,
        });
      } else if (error.message.includes("404")) {
        toast.error("Shipping zone not found", {
          description: "The selected zone may have been deleted.",
          duration: 6000,
        });
      } else {
        toast.error(error.message || "Failed to create shipping rate");
      }
    },
  });
}

/**
 * Update an existing shipping rate
 * Uses PUT /v1/shipping/rates/{id}
 */
export function useUpdateShippingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rateId,
      values,
    }: {
      rateId: string;
      values: UpdateShippingRateDto;
    }) => updateShippingRateAction(rateId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Shipping rate updated successfully");

        // Update specific rate cache
        queryClient.setQueryData(shippingKeys.rateDetail(variables.rateId), {
          success: true,
          data: data.data,
        });

        // Invalidate zone rates lists
        queryClient.invalidateQueries({
          queryKey: [...shippingKeys.all, "zones", data.data.zoneId, "rates"],
        });
      } else {
        toast.error(data.error || "Failed to update shipping rate");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shipping rate");
    },
  });
}

/**
 * Delete a shipping rate
 * Uses DELETE /v1/shipping/rates/{id}
 */
export function useDeleteShippingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rateId: string) => deleteShippingRateAction(rateId),
    onSuccess: (data, rateId) => {
      if (data.success) {
        toast.success("Shipping rate deleted successfully");

        // Remove from cache
        queryClient.removeQueries({
          queryKey: shippingKeys.rateDetail(rateId),
        });

        // Invalidate all zone rates (we don't know which zone this rate belonged to)
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey as string[];
            return queryKey.includes("shipping") && queryKey.includes("rates");
          },
        });
      } else {
        toast.error(data.error || "Failed to delete shipping rate");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete shipping rate");
    },
  });
}

// Calculation Mutation

/**
 * Calculate shipping options (mutation version for real-time calculations)
 * Uses POST /v1/shipping/calculate
 */
export function useCalculateShipping() {
  return useMutation({
    mutationFn: (values: CalculateShippingDto) =>
      calculateShippingAction(values),
    onSuccess: (data) => {
      if (data.success && data.data.length === 0) {
        toast.warning("No shipping options available for this destination", {
          description: "Please try a different address or contact support.",
          duration: 8000,
        });
      }
      // Success with options is typically handled in the component
    },
    onError: (error: Error) => {
      if (error.message.includes("400")) {
        toast.error("Invalid calculation parameters", {
          description: "Please check the shipping address and try again.",
          duration: 6000,
        });
      } else if (error.message.includes("404")) {
        toast.error("No shipping options available for this destination", {
          description: "We don't currently ship to this location.",
          duration: 8000,
        });
      } else {
        toast.error(error.message || "Failed to calculate shipping");
      }
    },
  });
}

// Utility Hooks

/**
 * Manual refetch hook for shipping zones
 */
export function useRefetchShippingZones() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetShippingZonesDto) => {
      queryClient.invalidateQueries({
        queryKey: shippingKeys.zonesList(params),
      });
    },
    [queryClient]
  );
}

/**
 * Manual refetch hook for zone rates
 */
export function useRefetchZoneRates() {
  const queryClient = useQueryClient();

  return useCallback(
    (zoneId: string, params?: GetShippingRatesDto) => {
      queryClient.invalidateQueries({
        queryKey: shippingKeys.zoneRates(zoneId, params),
      });
    },
    [queryClient]
  );
}

/**
 * Get shipping zones from cache without triggering network request
 */
export function useShippingZonesFromCache(params?: GetShippingZonesDto) {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(shippingKeys.zonesList(params));
}

/**
 * Prefetch zone data
 */
export function usePrefetchZone() {
  const queryClient = useQueryClient();

  return useCallback(
    (zoneId: string) => {
      queryClient.prefetchQuery({
        queryKey: shippingKeys.zoneDetail(zoneId),
        queryFn: () => getShippingZoneByIdAction(zoneId),
        staleTime: 15 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Prefetch zone rates
 */
export function usePrefetchZoneRates() {
  const queryClient = useQueryClient();

  return useCallback(
    (zoneId: string, params?: GetShippingRatesDto) => {
      queryClient.prefetchQuery({
        queryKey: shippingKeys.zoneRates(zoneId, params),
        queryFn: () => getShippingRatesByZoneAction(zoneId, params),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Get active shipping zones (helper hook)
 */
export function useActiveShippingZones(params?: GetShippingZonesDto) {
  return useQuery({
    queryKey: [...shippingKeys.zonesList(params), "active"],
    queryFn: async () => {
      const response = await getShippingZonesAction(params);
      if (!response.success) return [];

      return response.data.data.filter((zone) => zone.isActive);
    },
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Get active rates for a zone (helper hook)
 */
export function useActiveZoneRates(
  zoneId: string,
  params?: GetShippingRatesDto
) {
  return useQuery({
    queryKey: [...shippingKeys.zoneRates(zoneId, params), "active"],
    queryFn: async () => {
      const response = await getShippingRatesByZoneAction(zoneId, params);
      if (!response.success) return [];

      return response.data.data
        .filter((rate) => rate.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    enabled: !!zoneId,
    staleTime: 10 * 60 * 1000,
  });
}
