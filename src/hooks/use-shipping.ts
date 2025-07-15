/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getShippingZonesAction,
  createShippingZoneAction,
  updateShippingZoneAction,
  deleteShippingZoneAction,
  getZoneRatesAction,
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

// Zone Queries
export function useShippingZones() {
  return useQuery({
    queryKey: shippingKeys.zones(),
    queryFn: () => getShippingZonesAction(),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useZoneRates(zoneId: string, enabled = true) {
  return useQuery({
    queryKey: shippingKeys.zoneRates(zoneId),
    queryFn: () => getZoneRatesAction(zoneId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!zoneId,
  });
}

// Shipping Calculation
export function useShippingCalculation(
  params: ShippingCalculationDto,
  enabled = true
) {
  return useQuery({
    queryKey: shippingKeys.calculation(params),
    queryFn: () => calculateShippingAction(params),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!params.shippingAddress.country,
  });
}

// Zone Mutations
export function useCreateShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateShippingZoneDto) =>
      createShippingZoneAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Shipping zone created successfully");
        queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create shipping zone");
    },
  });
}

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
        queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });
        queryClient.invalidateQueries({
          queryKey: shippingKeys.zone(variables.zoneId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shipping zone");
    },
  });
}

export function useDeleteShippingZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteShippingZoneAction(zoneId),
    onSuccess: (data, zoneId) => {
      if (data.success) {
        toast.success("Shipping zone deleted successfully");
        queryClient.invalidateQueries({ queryKey: shippingKeys.zones() });
        queryClient.removeQueries({ queryKey: shippingKeys.zone(zoneId) });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete shipping zone");
    },
  });
}

// Rate Mutations
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
        queryClient.invalidateQueries({
          queryKey: shippingKeys.zoneRates(variables.zoneId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create shipping rate");
    },
  });
}

export function useUpdateShippingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rateId,
      values,
      zoneId,
    }: {
      rateId: string;
      values: UpdateShippingRateDto;
      zoneId: string;
    }) => updateShippingRateAction(rateId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Shipping rate updated successfully");
        queryClient.invalidateQueries({
          queryKey: shippingKeys.zoneRates(variables.zoneId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update shipping rate");
    },
  });
}

export function useDeleteShippingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rateId, zoneId }: { rateId: string; zoneId: string }) =>
      deleteShippingRateAction(rateId),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Shipping rate deleted successfully");
        queryClient.invalidateQueries({
          queryKey: shippingKeys.zoneRates(variables.zoneId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete shipping rate");
    },
  });
}

// Calculation Mutation (for real-time calculations)
export function useCalculateShipping() {
  return useMutation({
    mutationFn: (values: ShippingCalculationDto) =>
      calculateShippingAction(values),
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.error);
      }
      // Success handling is typically done in the component
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to calculate shipping");
    },
  });
}
