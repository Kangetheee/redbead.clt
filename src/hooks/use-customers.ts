"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";
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
  GetCustomerRecentOrdersDto,
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
  recentOrders: (id: string, params?: GetCustomerRecentOrdersDto) =>
    [...customerKeys.detail(id), "recent-orders", params] as const,
  savedDesigns: (id: string) =>
    [...customerKeys.detail(id), "saved-designs"] as const,
  quickActions: (id: string) =>
    [...customerKeys.detail(id), "quick-actions"] as const,
  activeOrders: (id: string) =>
    [...customerKeys.detail(id), "active-orders"] as const,
  orderTracking: (customerId: string, orderId: string) =>
    [...customerKeys.detail(customerId), "order-tracking", orderId] as const,
};

// Query Hooks

/**
 * Get customers with pagination and optional search
 * Uses GET /v1/customers
 */
export function useCustomers(params?: GetCustomersDto) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => getCustomersAction(params),
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
 * Get customer dashboard data
 * Uses GET /v1/customers/dashboard
 */
export function useCustomersDashboard() {
  return useQuery({
    queryKey: customerKeys.dashboard(),
    queryFn: () => getCustomersDashboardAction(),
    select: (data) => (data.success ? data.data : undefined),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Auto-refetch every 15 minutes
  });
}

/**
 * Get customer by ID
 * Uses GET /v1/customers/{id}
 */
export function useCustomer(customerId: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => getCustomerAction(customerId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get customer recent orders
 * Uses GET /v1/customers/{id}/recent-orders
 */
export function useCustomerRecentOrders(
  customerId: string,
  params?: GetCustomerRecentOrdersDto,
  enabled = true
) {
  return useQuery({
    queryKey: customerKeys.recentOrders(customerId, params),
    queryFn: () => getCustomerRecentOrdersAction(customerId, params),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes - orders change frequently
  });
}

/**
 * Get designs saved by a specific customer
 * Uses GET /v1/customers/{id}/saved-designs
 */
export function useCustomerSavedDesigns(customerId: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.savedDesigns(customerId),
    queryFn: () => getCustomerSavedDesignsAction(customerId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
    staleTime: 15 * 60 * 1000, // 15 minutes - designs don't change often
  });
}

/**
 * Get available quick actions for a specific customer
 * Uses GET /v1/customers/{id}/quick-actions
 */
export function useCustomerQuickActions(customerId: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.quickActions(customerId),
    queryFn: () => getCustomerQuickActionsAction(customerId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get active orders for a specific customer
 * Uses GET /v1/customers/{id}/orders/active
 */
export function useCustomerActiveOrders(customerId: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.activeOrders(customerId),
    queryFn: () => getCustomerActiveOrdersAction(customerId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes - active orders change frequently
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Get detailed tracking information for a customer order
 * Uses GET /v1/customers/{id}/orders/{orderId}/tracking
 */
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
    staleTime: 1 * 60 * 1000, // 1 minute - tracking info changes frequently
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });
}

// Mutation Hooks

/**
 * Create a new customer record
 * Uses POST /v1/customers
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateCustomerDto) => createCustomerAction(values),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Customer created successfully");

        // Invalidate customers list and dashboard
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        queryClient.invalidateQueries({ queryKey: customerKeys.dashboard() });

        // Set the created customer in cache
        queryClient.setQueryData(customerKeys.detail(data.data.id), {
          success: true,
          data: data.data,
        });
      } else {
        toast.error(data.error || "Failed to create customer");
      }
    },
    onError: (error: Error) => {
      // Handle specific error types
      if (error.message.includes("400")) {
        toast.error("Invalid customer data or email/phone already exists", {
          description: "Please check the information and try again.",
          duration: 8000,
        });
      } else {
        toast.error(error.message || "Failed to create customer");
      }
    },
  });
}

/**
 * Update customer information
 * Uses PATCH /v1/customers/{id}
 */
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

        // Update specific customer cache
        queryClient.setQueryData(customerKeys.detail(variables.customerId), {
          success: true,
          data: data.data,
        });

        // Invalidate customers list and dashboard
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        queryClient.invalidateQueries({ queryKey: customerKeys.dashboard() });
      } else {
        toast.error(data.error || "Failed to update customer");
      }
    },
    onError: (error: Error) => {
      // Handle specific error types
      if (error.message.includes("400")) {
        toast.error("Invalid data or email/phone already exists", {
          description: "Please check the information and try again.",
          duration: 8000,
        });
      } else if (error.message.includes("404")) {
        toast.error("Customer not found", {
          description: "The customer may have been deleted.",
          duration: 6000,
        });
      } else {
        toast.error(error.message || "Failed to update customer");
      }
    },
  });
}

/**
 * Delete a customer record
 * Uses DELETE /v1/customers/{id}
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => deleteCustomerAction(customerId),
    onSuccess: (data, customerId) => {
      if (data.success) {
        toast.success("Customer deleted successfully");

        // Remove from cache
        queryClient.removeQueries({
          queryKey: customerKeys.detail(customerId),
        });

        // Invalidate customers list and dashboard
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
        queryClient.invalidateQueries({ queryKey: customerKeys.dashboard() });
      } else {
        toast.error(data.error || "Failed to delete customer");
      }
    },
    onError: (error: Error) => {
      // Handle specific error types
      if (error.message.includes("400")) {
        toast.error("Cannot delete customer with existing orders", {
          description: "Please resolve or transfer existing orders first.",
          duration: 10000,
        });
      } else if (error.message.includes("404")) {
        toast.error("Customer not found", {
          description: "The customer may have already been deleted.",
          duration: 6000,
        });
      } else {
        toast.error(error.message || "Failed to delete customer");
      }
    },
  });
}

// Utility Hooks

/**
 * Manual refetch hook for customers list
 */
export function useRefetchCustomers() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: GetCustomersDto) => {
      queryClient.invalidateQueries({
        queryKey: params ? customerKeys.list(params) : customerKeys.lists(),
      });
    },
    [queryClient]
  );
}

/**
 * Manual refetch hook for customer dashboard
 */
export function useRefetchCustomersDashboard() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: customerKeys.dashboard() });
  }, [queryClient]);
}

/**
 * Get customer from cache without triggering network request
 */
export function useCustomerFromCache(customerId: string) {
  const queryClient = useQueryClient();

  return queryClient.getQueryData(customerKeys.detail(customerId));
}

/**
 * Prefetch customer data
 */
export function usePrefetchCustomer() {
  const queryClient = useQueryClient();

  return useCallback(
    (customerId: string) => {
      queryClient.prefetchQuery({
        queryKey: customerKeys.detail(customerId),
        queryFn: () => getCustomerAction(customerId),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

/**
 * Hook for managing customer-related loading states
 */
export function useCustomerLoadingState() {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  return {
    isLoading:
      createCustomer.isPending ||
      updateCustomer.isPending ||
      deleteCustomer.isPending,
    isCreating: createCustomer.isPending,
    isUpdating: updateCustomer.isPending,
    isDeleting: deleteCustomer.isPending,
  };
}
