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
} from "@/lib/orders/orders.action";
import {
  GetOrdersDto,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  CreateOrderNoteDto,
  RequestDesignApprovalDto,
  UpdateDesignApprovalDto,
} from "@/lib/orders/dto/orders.dto";
import { toast } from "sonner";

export function useOrders(params?: GetOrdersDto) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrdersAction(params),
    select: (response) => {
      if (!response.success) {
        return {
          success: false as const, // ✅ ensure this is literal `false`
          error: response.error,
        };
      }
      return response;
    },
  });
}

// Get Order by ID
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrderAction(orderId),
    enabled: !!orderId,
  });
}

// Create Order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateOrderDto) => createOrderAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create order");
    },
  });
}

// Update Order
export function useUpdateOrder(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateOrderDto) => updateOrderAction(orderId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      toast.success("Order updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update order");
    },
  });
}

// Update Order Status
export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateOrderStatusDto) =>
      updateOrderStatusAction(orderId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update order status");
    },
  });
}

// Get Order Notes
export function useOrderNotes(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId, "notes"],
    queryFn: () => getOrderNotesAction(orderId),
    enabled: !!orderId,
  });
}

// Add Order Note
export function useAddOrderNote(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateOrderNoteDto) =>
      addOrderNoteAction(orderId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", orderId, "notes"] });
      toast.success("Note added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add note");
    },
  });
}

// Request Design Approval
export function useRequestDesignApproval(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RequestDesignApprovalDto) =>
      requestDesignApprovalAction(orderId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({
        queryKey: ["orders", orderId, "design-approval"],
      });
      toast.success("Design approval requested successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to request design approval");
    },
  });
}

// Get Design Approval
export function useDesignApproval(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId, "design-approval"],
    queryFn: () => getDesignApprovalAction(orderId),
    enabled: !!orderId,
  });
}

// Update Design Approval
export function useUpdateDesignApproval(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateDesignApprovalDto) =>
      updateDesignApprovalAction(orderId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      queryClient.invalidateQueries({
        queryKey: ["orders", orderId, "design-approval"],
      });
      toast.success("Design approval updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update design approval");
    },
  });
}
