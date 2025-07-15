/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";

// Get addresses with pagination
export function useAddresses(params?: GetAddressesDto) {
  return useQuery({
    queryKey: ["addresses", params],
    queryFn: () => getAddressesAction(params),
  });
}

// Get address by ID
export function useAddress(addressId: string) {
  return useQuery({
    queryKey: ["addresses", addressId],
    queryFn: () => getAddressByIdAction(addressId),
    enabled: !!addressId,
  });
}

// Get default address by type
export function useDefaultAddress(type: AddressType) {
  return useQuery({
    queryKey: ["addresses", "default", type],
    queryFn: () => getDefaultAddressByTypeAction(type),
  });
}

// Create address
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateAddressDto) => createAddressAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create address");
    },
  });
}

// Update address
export function useUpdateAddress(addressId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateAddressDto) =>
      updateAddressAction(addressId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", addressId] });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update address");
    },
  });
}

// Delete address
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteAddressAction(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete address");
    },
  });
}

// Set address as default
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => setDefaultAddressAction(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["addresses", "default"] });
      toast.success("Address set as default successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to set address as default");
    },
  });
}
