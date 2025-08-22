"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOrdersAction,
  getOrderAction,
  trackOrderAction,
  getDesignApprovalAction,
  addCustomerInstructionsAction,
  getCustomerNotesAction,
  reorderAction,
  approveDesignViaTokenAction,
  rejectDesignViaTokenAction,
} from "@/lib/orders/orders.action";

import {
  GetOrdersDto,
  CustomerInstructionsDto,
  ReorderDto,
} from "@/lib/orders/dto/orders.dto";

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: Partial<GetOrdersDto>) =>
    [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  tracking: (orderId: string) =>
    [...orderKeys.detail(orderId), "tracking"] as const,
  designApproval: (orderId: string) =>
    [...orderKeys.detail(orderId), "designApproval"] as const,
  customerNotes: (orderId: string) =>
    [...orderKeys.detail(orderId), "customerNotes"] as const,
};

export function useOrders(params?: GetOrdersDto) {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: async () => {
      const result = await getOrdersAction(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    refetchOnWindowFocus: false,
  });
}

export function useOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const result = await getOrderAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

export function useTrackOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.tracking(orderId),
    queryFn: async () => {
      const result = await trackOrderAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

export function useDesignApproval(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.designApproval(orderId),
    queryFn: async () => {
      const result = await getDesignApprovalAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

export function useCustomerNotes(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.customerNotes(orderId),
    queryFn: async () => {
      const result = await getCustomerNotesAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

export function useAddCustomerInstructions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      instructions,
    }: {
      orderId: string;
      instructions: CustomerInstructionsDto;
    }) => {
      const result = await addCustomerInstructionsAction(orderId, instructions);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Instructions added successfully");
      queryClient.invalidateQueries({
        queryKey: orderKeys.customerNotes(variables.orderId),
      });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      });
    },
    onError: (error) => {
      toast.error(`Failed to add instructions: ${error.message}`);
    },
  });
}

export function useReorder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderDto) => {
      const result = await reorderAction(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(`Reorder successful: ${data.message}`);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      toast.error(`Failed to reorder: ${error.message}`);
    },
  });
}

export function useApproveDesignViaToken() {
  return useMutation({
    mutationFn: async (token: string) => {
      const result = await approveDesignViaTokenAction(token);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Failed to approve design: ${error.message}`);
    },
  });
}

export function useRejectDesignViaToken() {
  return useMutation({
    mutationFn: async ({
      token,
      reason,
    }: {
      token: string;
      reason?: string;
    }) => {
      const result = await rejectDesignViaTokenAction(token, reason);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Failed to reject design: ${error.message}`);
    },
  });
}
