/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
import {
  getAddressesAction,
  getAddressByIdAction,
  getDefaultAddressByTypeAction,
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/address/address.action";
import {
  GetAddressesDto,
  CreateAddressDto,
  UpdateAddressDto,
} from "@/lib/address/dto/address.dto";
import { AddressType } from "@/lib/address/types/address.types";

// Query Keys
export const addressKeys = {
  all: ["addresses"] as const,
  lists: () => [...addressKeys.all, "list"] as const,
  list: (params?: GetAddressesDto) => [...addressKeys.lists(), params] as const,
  details: () => [...addressKeys.all, "detail"] as const,
  detail: (id: string) => [...addressKeys.details(), id] as const,
  defaults: () => [...addressKeys.all, "default"] as const,
  default: (type: AddressType) => [...addressKeys.defaults(), type] as const,
};

// Query Hooks

export function useAddresses(params?: GetAddressesDto) {
  return useQuery({
    queryKey: addressKeys.list(params),
    queryFn: () => getAddressesAction(params),
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

export function useAddress(addressId: string, enabled = true) {
  return useQuery({
    queryKey: addressKeys.detail(addressId),
    queryFn: () => getAddressByIdAction(addressId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!addressId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDefaultAddress(type: AddressType, enabled = true) {
  return useQuery({
    queryKey: addressKeys.default(type),
    queryFn: () => getDefaultAddressByTypeAction(type),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!type,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (no default address found)
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateAddressDto) => createAddressAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Address created successfully");

        // Invalidate address lists
        queryClient.invalidateQueries({ queryKey: addressKeys.lists() });

        // Set the created address in cache
        queryClient.setQueryData(addressKeys.detail(data.data.id), {
          success: true,
          data: data.data,
        });

        // If this is set as default, invalidate default queries
        if (data.data.isDefault) {
          queryClient.invalidateQueries({
            queryKey: addressKeys.default(data.data.addressType),
          });
        }
      } else {
        toast.error(data.error || "Failed to create address");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create address");
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      values,
    }: {
      addressId: string;
      values: UpdateAddressDto;
    }) => updateAddressAction(addressId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Address updated successfully");

        // Update specific address cache
        queryClient.setQueryData(addressKeys.detail(variables.addressId), {
          success: true,
          data: data.data,
        });

        // Invalidate lists to reflect changes
        queryClient.invalidateQueries({ queryKey: addressKeys.lists() });

        // If this is set as default, invalidate default queries
        if (data.data.isDefault) {
          queryClient.invalidateQueries({
            queryKey: addressKeys.default(data.data.addressType),
          });
        }
      } else {
        toast.error(data.error || "Failed to update address");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update address");
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteAddressAction(addressId),
    onSuccess: (data, addressId) => {
      if (data.success) {
        toast.success("Address deleted successfully");

        // Remove from cache
        queryClient.removeQueries({
          queryKey: addressKeys.detail(addressId),
        });

        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: addressKeys.lists() });

        // Invalidate all default queries since we don't know which type was deleted
        queryClient.invalidateQueries({ queryKey: addressKeys.defaults() });
      } else {
        toast.error(data.error || "Failed to delete address");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => setDefaultAddressAction(addressId),
    onSuccess: (data, addressId) => {
      if (data.success) {
        toast.success("Address set as default successfully");

        // Update the specific address cache
        queryClient.setQueryData(addressKeys.detail(addressId), {
          success: true,
          data: data.data,
        });

        // Invalidate lists to update default status
        queryClient.invalidateQueries({ queryKey: addressKeys.lists() });

        // Invalidate the specific default query for this type
        queryClient.invalidateQueries({
          queryKey: addressKeys.default(data.data.addressType),
        });

        // Also invalidate all defaults since setting one as default might unset others
        queryClient.invalidateQueries({ queryKey: addressKeys.defaults() });
      } else {
        toast.error(data.error || "Failed to set address as default");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to set address as default");
    },
  });
}

// Utility Hooks

/**
 * Manual refetch hook for addresses list
 */
export function useRefetchAddresses() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetAddressesDto) => {
      queryClient.invalidateQueries({
        queryKey: params ? addressKeys.list(params) : addressKeys.lists(),
      });
    },
    [queryClient]
  );
}

/**
 * Get address by ID from cache (doesn't trigger network request)
 */
export function useAddressFromCache(addressId: string) {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(addressKeys.detail(addressId));
}

/**
 * Prefetch address data
 */
export function usePrefetchAddress() {
  const queryClient = useQueryClient();

  return useCallback(
    (addressId: string) => {
      queryClient.prefetchQuery({
        queryKey: addressKeys.detail(addressId),
        queryFn: () => getAddressByIdAction(addressId),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Get addresses by type from cache
 */
export function useAddressesByType(type: AddressType) {
  return useQuery({
    queryKey: [...addressKeys.all, "by-type", type],
    queryFn: async () => {
      const response = await getAddressesAction();
      if (!response.success) return [];

      return response.data.items.filter(
        (address) =>
          address.addressType === type || address.addressType === "BOTH"
      );
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Check if address can be deleted (useful for UI state)
 */
export function useCanDeleteAddress(addressId: string) {
  const { data: address } = useAddress(addressId);

  // You might want to add additional logic here based on business rules
  // For example, checking if address is used in pending orders
  return {
    canDelete: !!address && !address.isDefault,
    reason: address?.isDefault ? "Cannot delete default address" : undefined,
  };
}
