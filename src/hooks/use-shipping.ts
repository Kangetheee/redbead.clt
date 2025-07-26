"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
import {
  getShippingZonesAction,
  createShippingZoneAction,
  getZoneRatesAction,
  createShippingRateAction,
  calculateShippingAction,
} from "@/lib/shipping/shipping.actions";
import {
  CreateShippingZoneDto,
  CreateShippingRateDto,
  ShippingCalculationDto,
} from "@/lib/shipping/dto/shipping.dto";

// Query Keys
export const shippingKeys = {
  all: ["shipping"] as const,
  zones: () => [...shippingKeys.all, "zones"] as const,
  zone: (id: string) => [...shippingKeys.zones(), id] as const,
  zoneRates: (zoneId: string) =>
    [...shippingKeys.zone(zoneId), "rates"] as const,
  calculation: (params: ShippingCalculationDto) =>
    [...shippingKeys.all, "calculation", params] as const,
};

// Query Hooks

/**
 * Get all active shipping zones with their countries
 * Uses GET /v1/shipping/zones
 */
export function useShippingZones() {
  return useQuery({
    queryKey: shippingKeys.zones(),
    queryFn: () => getShippingZonesAction(),
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
 * Get all shipping rates for a specific zone
 * Uses GET /v1/shipping/zones/{id}/rates
 */
export function useZoneRates(zoneId: string, enabled = true) {
  return useQuery({
    queryKey: shippingKeys.zoneRates(zoneId),
    queryFn: () => getZoneRatesAction(zoneId),
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
    staleTime: 10 * 60 * 1000, // 10 minutes - rates change less frequently
  });
}

/**
 * Calculate shipping options for a destination (query version)
 * Uses POST /v1/shipping/calculate
 */
export function useShippingCalculation(
  params: ShippingCalculationDto,
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
    enabled: enabled && !!params.shippingAddress.country,
    staleTime: 5 * 60 * 1000, // 5 minutes - calculations can be cached briefly
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (no shipping options available)
      if (error?.message?.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Mutation Hooks

/**
 * Create a new shipping zone with countries
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

        // Show zone details
        toast.info(
          `Zone "${data.data.name}" created with ${data.data.countries.length} countries`,
          {
            duration: 6000,
          }
        );
      } else {
        toast.error(data.error || "Failed to create shipping zone");
      }
    },
    onError: (error: Error) => {
      // Handle specific error cases
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
 * Create a new shipping rate for a specific zone
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
          queryKey: shippingKeys.zoneRates(variables.zoneId),
        });

        // Show rate details
        const freeShipping = data.data.freeShippingThreshold
          ? ` (Free shipping over $${data.data.freeShippingThreshold})`
          : "";
        toast.info(
          `"${data.data.name}" created - $${data.data.baseRate} base rate${freeShipping}`,
          {
            duration: 6000,
          }
        );
      } else {
        toast.error(data.error || "Failed to create shipping rate");
      }
    },
    onError: (error: Error) => {
      // Handle specific error cases
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
 * Calculate shipping options (mutation version for real-time calculations)
 * Uses POST /v1/shipping/calculate
 */
export function useCalculateShipping() {
  return useMutation({
    mutationFn: (values: ShippingCalculationDto) =>
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
      // Handle specific error cases
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

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });
  }, [queryClient]);
}

/**
 * Manual refetch hook for zone rates
 */
export function useRefetchZoneRates() {
  const queryClient = useQueryClient();

  return useCallback(
    (zoneId: string) => {
      queryClient.invalidateQueries({
        queryKey: shippingKeys.zoneRates(zoneId),
      });
    },
    [queryClient]
  );
}

/**
 * Get shipping zones from cache without triggering network request
 */
export function useShippingZonesFromCache() {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(shippingKeys.zones());
}

/**
 * Prefetch zone rates
 */
export function usePrefetchZoneRates() {
  const queryClient = useQueryClient();

  return useCallback(
    (zoneId: string) => {
      queryClient.prefetchQuery({
        queryKey: shippingKeys.zoneRates(zoneId),
        queryFn: () => getZoneRatesAction(zoneId),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Hook for managing shipping-related loading states
 */
export function useShippingLoadingState() {
  const createZone = useCreateShippingZone();
  const createRate = useCreateShippingRate();
  const calculateShipping = useCalculateShipping();

  return {
    isLoading:
      createZone.isPending ||
      createRate.isPending ||
      calculateShipping.isPending,
    isCreatingZone: createZone.isPending,
    isCreatingRate: createRate.isPending,
    isCalculating: calculateShipping.isPending,
  };
}
