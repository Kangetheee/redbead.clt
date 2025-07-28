/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  getPaymentStatusAction,
  completeDesignApprovalAction,
  getOrderItemsAction,
  getProductionRequirementsAction,
  calculateTimelineAction,
  updateOrderItemStatusAction,
  bulkUpdateOrderItemStatusAction,
  getOrderItemsByStatusAction,
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
import { toast } from "sonner";

// Query Keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params?: GetOrdersDto) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  notes: (orderId: string) => [...orderKeys.all, orderId, "notes"] as const,
  designApproval: (orderId: string) =>
    [...orderKeys.all, orderId, "design-approval"] as const,
  paymentStatus: (orderId: string) =>
    [...orderKeys.all, orderId, "payment-status"] as const,
  items: (orderId: string) => [...orderKeys.all, orderId, "items"] as const,
  productionRequirements: (orderId: string) =>
    [...orderKeys.all, orderId, "production-requirements"] as const,
  timeline: (orderId: string, startDate: string) =>
    [...orderKeys.all, orderId, "timeline", startDate] as const,
};

export const orderItemKeys = {
  all: ["order-items"] as const,
  byStatus: (status: string, templateId: string) =>
    [...orderItemKeys.all, "status", status, templateId] as const,
};

// Query Hooks
export function useOrders(params?: GetOrdersDto) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getOrdersAction(params),
    select: (response) => {
      if (!response.success) {
        return {
          success: false as const,
          error: response.error,
        };
      }
      return response;
    },
  });
}

export function useOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
  });
}

export function useOrderNotes(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.notes(orderId),
    queryFn: () => getOrderNotesAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
  });
}

export function useDesignApproval(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.designApproval(orderId),
    queryFn: () => getDesignApprovalAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
  });
}

export function usePaymentStatus(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.paymentStatus(orderId),
    queryFn: () => getPaymentStatusAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
  });
}

export function useOrderItems(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.items(orderId),
    queryFn: () => getOrderItemsAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
  });
}

export function useProductionRequirements(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.productionRequirements(orderId),
    queryFn: () => getProductionRequirementsAction(orderId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!orderId,
  });
}

export function useOrderItemsByStatus(
  status: string,
  templateId: string,
  enabled = true
) {
  return useQuery({
    queryKey: orderItemKeys.byStatus(status, templateId),
    queryFn: () => getOrderItemsByStatusAction(status, templateId),
    select: (data) => (data.success ? data.data : undefined),
    enabled: enabled && !!status && !!templateId,
  });
}

// Mutation Hooks
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateOrderDto) => createOrderAction(values),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: orderKeys.all });
        toast.success("Order created successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create order");
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values: UpdateOrderDto;
    }) => updateOrderAction(orderId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(variables.orderId),
        });
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        toast.success("Order updated successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update order");
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values: UpdateOrderStatusDto;
    }) => updateOrderStatusAction(orderId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(variables.orderId),
        });
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        toast.success("Order status updated successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update order status");
    },
  });
}

export function useAddOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values: CreateOrderNoteDto;
    }) => addOrderNoteAction(orderId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.notes(variables.orderId),
        });
        toast.success("Note added successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add note");
    },
  });
}
export function useRequestDesignApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values: RequestDesignApprovalDto;
    }) => requestDesignApprovalAction(orderId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(variables.orderId),
        });
        queryClient.invalidateQueries({
          queryKey: orderKeys.designApproval(variables.orderId),
        });
        toast.success("Design approval requested successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to request design approval");
    },
  });
}

export function useUpdateDesignApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values: UpdateDesignApprovalDto;
    }) => updateDesignApprovalAction(orderId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(variables.orderId),
        });
        queryClient.invalidateQueries({
          queryKey: orderKeys.designApproval(variables.orderId),
        });
        toast.success("Design approval updated successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update design approval");
    },
  });
}

export function useCompleteDesignApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => completeDesignApprovalAction(orderId),
    onSuccess: (data, orderId) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
        queryClient.invalidateQueries({
          queryKey: orderKeys.designApproval(orderId),
        });
        queryClient.invalidateQueries({
          queryKey: orderKeys.paymentStatus(orderId),
        });
        toast.success("Design approval process completed successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to complete design approval");
    },
  });
}

export function useCalculateTimeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      values,
    }: {
      orderId: string;
      values: CalculateTimelineDto;
    }) => calculateTimelineAction(orderId, values),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.setQueryData(
          orderKeys.timeline(variables.orderId, variables.values.startDate),
          data.data
        );
        toast.success("Timeline calculated successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to calculate timeline");
    },
  });
}

// Order Item Mutations
export function useUpdateOrderItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderItemId,
      values,
    }: {
      orderItemId: string;
      values: UpdateOrderItemStatusDto;
    }) => updateOrderItemStatusAction(orderItemId, values),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: orderKeys.all });
        queryClient.invalidateQueries({ queryKey: orderItemKeys.all });
        toast.success("Order item status updated successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update order item status");
    },
  });
}

export function useBulkUpdateOrderItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BulkUpdateOrderItemStatusDto) =>
      bulkUpdateOrderItemStatusAction(values),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: orderKeys.all });
        queryClient.invalidateQueries({ queryKey: orderItemKeys.all });
        toast.success("Order items updated successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update order items");
    },
  });
}

// Utility hook for refetching payment status
export function useRefetchPaymentStatus() {
  const queryClient = useQueryClient();

  return (orderId: string) => {
    queryClient.invalidateQueries({
      queryKey: orderKeys.paymentStatus(orderId),
    });
  };
}
