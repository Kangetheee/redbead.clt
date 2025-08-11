/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOrdersAction,
  getOrderAction,
  createOrderAction,
  updateOrderAction,
  updateOrderStatusAction,
  getOrderNotesAction,
  addOrderNoteAction,
  requestDesignApprovalAction,
  getDesignApprovalAction,
  updateDesignApprovalAction,
  completeDesignApprovalAction,
  getPaymentStatusAction,
  getOrderItemsAction,
  updateOrderItemStatusAction,
  bulkUpdateOrderItemStatusAction,
  getOrderItemsByStatusAction,
  getProductionRequirementsAction,
  calculateTimelineAction,
} from "@/lib/orders/orders.action";

import {
  GetOrdersDto,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  CreateOrderNoteDto,
  RequestDesignApprovalDto,
  UpdateDesignApprovalDto,
  UpdateOrderItemStatusDto,
  BulkUpdateOrderItemStatusDto,
  CalculateTimelineDto,
} from "@/lib/orders/dto/orders.dto";

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: Partial<GetOrdersDto>) =>
    [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  notes: (orderId: string) => [...orderKeys.detail(orderId), "notes"] as const,
  designApproval: (orderId: string) =>
    [...orderKeys.detail(orderId), "designApproval"] as const,
  paymentStatus: (orderId: string) =>
    [...orderKeys.detail(orderId), "paymentStatus"] as const,
  items: (orderId: string) => [...orderKeys.detail(orderId), "items"] as const,
  itemsByStatus: (status: string, templateId: string) =>
    [...orderKeys.all, "itemsByStatus", status, templateId] as const,
  productionRequirements: (orderId: string) =>
    [...orderKeys.detail(orderId), "productionRequirements"] as const,
};

/**
 * Hook to get orders with pagination and filtering
 */
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

/**
 * Hook to get a single order by ID
 */
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

/**
 * Hook to create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateOrderDto) => {
      const result = await createOrderAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Order created successfully");
      queryClient.setQueryData(orderKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Invalidate cart data if order was created from cart
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
}

/**
 * Hook to update an order
 * Fixed: Remove orderId parameter and expect it in the mutation payload
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      values,
    }: {
      orderId: string;
      values: UpdateOrderDto;
    }) => {
      const result = await updateOrderAction(orderId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Order updated successfully");
      queryClient.setQueryData(orderKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error.message}`);
    },
  });
}

/**
 * Hook to update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      values,
    }: {
      orderId: string;
      values: UpdateOrderStatusDto;
    }) => {
      const result = await updateOrderStatusAction(orderId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(`Order status updated to ${data.status}`);
      queryClient.setQueryData(orderKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });
}

/**
 * Hook to get order notes
 */
export function useOrderNotes(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.notes(orderId),
    queryFn: async () => {
      const result = await getOrderNotesAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to add a note to an order
 */
export function useAddOrderNote(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateOrderNoteDto) => {
      const result = await addOrderNoteAction(orderId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Note added successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.notes(orderId) });
    },
    onError: (error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
}

/**
 * Hook to request design approval
 */
export function useRequestDesignApproval(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: RequestDesignApprovalDto) => {
      const result = await requestDesignApprovalAction(orderId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Design approval request sent");
      queryClient.invalidateQueries({
        queryKey: orderKeys.designApproval(orderId),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
    onError: (error) => {
      toast.error(`Failed to request design approval: ${error.message}`);
    },
  });
}

/**
 * Hook to get design approval status
 */
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

/**
 * Hook to update design approval status
 */
export function useUpdateDesignApproval(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: UpdateDesignApprovalDto) => {
      const result = await updateDesignApprovalAction(orderId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success(`Design approval status updated to ${data.status}`);
      queryClient.invalidateQueries({
        queryKey: orderKeys.designApproval(orderId),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
    onError: (error) => {
      toast.error(`Failed to update design approval: ${error.message}`);
    },
  });
}

/**
 * Hook to complete design approval process
 */
export function useCompleteDesignApproval(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await completeDesignApprovalAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Design approval process completed");
      queryClient.invalidateQueries({
        queryKey: orderKeys.designApproval(orderId),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
    onError: (error) => {
      toast.error(`Failed to complete design approval: ${error.message}`);
    },
  });
}

/**
 * Hook to get payment status
 */
export function usePaymentStatus(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.paymentStatus(orderId),
    queryFn: async () => {
      const result = await getPaymentStatusAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get order items
 */
export function useOrderItems(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.items(orderId),
    queryFn: async () => {
      const result = await getOrderItemsAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to update order item status
 */
export function useUpdateOrderItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderItemId,
      values,
    }: {
      orderItemId: string;
      values: UpdateOrderItemStatusDto;
    }) => {
      const result = await updateOrderItemStatusAction(orderItemId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Item status updated successfully");
      // We don't know which order this item belongs to, so invalidate all order items queries
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error) => {
      toast.error(`Failed to update item status: ${error.message}`);
    },
  });
}

/**
 * Hook to bulk update order item statuses
 */
export function useBulkUpdateOrderItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: BulkUpdateOrderItemStatusDto) => {
      const result = await bulkUpdateOrderItemStatusAction(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Items status updated successfully");
      // Invalidate all order items queries
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error) => {
      toast.error(`Failed to update items status: ${error.message}`);
    },
  });
}

/**
 * Hook to get order items by status
 */
export function useOrderItemsByStatus(
  status: string,
  templateId: string,
  enabled = true
) {
  return useQuery({
    queryKey: orderKeys.itemsByStatus(status, templateId),
    queryFn: async () => {
      const result = await getOrderItemsByStatusAction(status, templateId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!status && !!templateId,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get production requirements
 */
export function useProductionRequirements(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.productionRequirements(orderId),
    queryFn: async () => {
      const result = await getProductionRequirementsAction(orderId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && !!orderId,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to calculate order timeline
 */
export function useCalculateTimeline(orderId: string) {
  return useMutation({
    mutationFn: async (values: CalculateTimelineDto) => {
      const result = await calculateTimelineAction(orderId, values);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Timeline calculated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to calculate timeline: ${error.message}`);
    },
  });
}
