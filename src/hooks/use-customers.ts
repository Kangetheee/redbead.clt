"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCustomersAction,
  getCustomersDashboardAction,
  getCustomerAction,
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  getCustomerRecentOrdersAction,
  getCustomerSavedDesignsAction,
  getCustomerQuickActionsAction,
  getCustomerActiveOrdersAction,
  getCustomerOrderTrackingAction,
} from "@/lib/customers/customers.action";
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  GetCustomersDto,
} from "@/lib/customers/dto/customers.dto";

// Query Keys
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params?: GetCustomersDto) =>
    [...customerKeys.lists(), params] as const,
  dashboard: () => [...customerKeys.all, "dashboard"] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  recentOrders: (id: string, limit?: number) =>
    [...customerKeys.detail(id), "recent-orders", limit] as const,
  savedDesigns: (id: string) =>
    [...customerKeys.detail(id), "saved-designs"] as const,
  quickActions: (id: string) =>
    [...customerKeys.detail(id), "quick-actions"] as const,
  activeOrders: (id: string) =>
    [...customerKeys.detail(id), "active-orders"] as const,
  orderTracking: (customerId: string, orderId: string) =>
    [...customerKeys.detail(customerId), "order-tracking", orderId] as const,
};

// Queries
export function useCustomers(params?: GetCustomersDto) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomersAction(params),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useCustomersDashboard() {
  return useQuery({
    queryKey: customerKeys.dashboard(),
    queryFn: () => getCustomersDashboardAction(),
    select: (data) => (data.success ? data.data : undefined),
  });
}

export function useCustomer(customerId: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => getCustomerAction(customerId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
  });
}

export function useCustomerRecentOrders(
  customerId: string,
  limit?: number,
  enabled = true
) {
  return useQuery({
    queryKey: customerKeys.recentOrders(customerId, limit),
    queryFn: () => getCustomerRecentOrdersAction(customerId, limit),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
  });
}

export function useCustomerSavedDesigns(customerId: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.savedDesigns(customerId),
    queryFn: () => getCustomerSavedDesignsAction(customerId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
  });
}

export function useCustomerQuickActions(customerId: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.quickActions(customerId),
    queryFn: () => getCustomerQuickActionsAction(customerId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
  });
}

export function useCustomerActiveOrders(customerId: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.activeOrders(customerId),
    queryFn: () => getCustomerActiveOrdersAction(customerId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
  });
}

export function useCustomerOrderTracking(
  customerId: string,
  orderId: string,
  enabled = true
) {
  return useQuery({
    queryKey: customerKeys.orderTracking(customerId, orderId),
    queryFn: () => getCustomerOrderTrackingAction(customerId, orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId && !!orderId,
  });
}

// Mutations
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateCustomerDto) => createCustomerAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Customer created successfully");
        queryClient.invalidateQueries({ queryKey: customerKeys.all });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create customer");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      values,
    }: {
      customerId: string;
      values: UpdateCustomerDto;
    }) => updateCustomerAction(customerId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Customer updated successfully");
        queryClient.invalidateQueries({ queryKey: customerKeys.all });
        queryClient.invalidateQueries({
          queryKey: customerKeys.detail(variables.customerId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update customer");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => deleteCustomerAction(customerId),
    onSuccess: (data, customerId) => {
      if (data.success) {
        toast.success("Customer deleted successfully");
        queryClient.invalidateQueries({ queryKey: customerKeys.all });
        queryClient.removeQueries({
          queryKey: customerKeys.detail(customerId),
        });
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete customer");
    },
  });
}
