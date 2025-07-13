import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBulkOrdersAction,
  getBulkOrderAction,
  createBulkOrderAction,
  updateBulkOrderAction,
  deleteBulkOrderAction,
  createBulkOrderQuoteAction,
  acceptBulkOrderQuoteAction,
  convertBulkOrderToOrderAction,
} from "@/lib/orders/bulk-orders.actions";
import {
  CreateBulkOrderDto,
  UpdateBulkOrderDto,
  GetBulkOrdersDto,
} from "@/lib/orders/dto/bulk-order.dto";
import { CreateBulkOrderQuoteDto } from "@/lib/orders/dto/bulk-quote.dto";
import { BulkOrderConversionDto } from "@/lib/orders/dto/bulk-convert.dto";

export const useBulkOrders = (params?: GetBulkOrdersDto) => {
  return useQuery({
    queryKey: ["bulk-orders", params],
    queryFn: () => getBulkOrdersAction(params),
  });
};

export const useBulkOrder = (bulkOrderId: string) => {
  return useQuery({
    queryKey: ["bulk-orders", bulkOrderId],
    queryFn: () => getBulkOrderAction(bulkOrderId),
    enabled: !!bulkOrderId,
  });
};

export const useCreateBulkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBulkOrderDto) => createBulkOrderAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulk-orders"] });
    },
  });
};

export const useUpdateBulkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bulkOrderId,
      data,
    }: {
      bulkOrderId: string;
      data: UpdateBulkOrderDto;
    }) => updateBulkOrderAction(bulkOrderId, data),
    onSuccess: (_, { bulkOrderId }) => {
      queryClient.invalidateQueries({ queryKey: ["bulk-orders"] });
      queryClient.invalidateQueries({ queryKey: ["bulk-orders", bulkOrderId] });
    },
  });
};

export const useDeleteBulkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkOrderId: string) => deleteBulkOrderAction(bulkOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulk-orders"] });
    },
  });
};

export const useCreateBulkOrderQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bulkOrderId,
      data,
    }: {
      bulkOrderId: string;
      data: CreateBulkOrderQuoteDto;
    }) => createBulkOrderQuoteAction(bulkOrderId, data),
    onSuccess: (_, { bulkOrderId }) => {
      queryClient.invalidateQueries({ queryKey: ["bulk-orders"] });
      queryClient.invalidateQueries({ queryKey: ["bulk-orders", bulkOrderId] });
    },
  });
};

export const useAcceptBulkOrderQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkOrderId: string) =>
      acceptBulkOrderQuoteAction(bulkOrderId),
    onSuccess: (_, bulkOrderId) => {
      queryClient.invalidateQueries({ queryKey: ["bulk-orders"] });
      queryClient.invalidateQueries({ queryKey: ["bulk-orders", bulkOrderId] });
    },
  });
};

export const useConvertBulkOrderToOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bulkOrderId,
      data,
    }: {
      bulkOrderId: string;
      data: BulkOrderConversionDto;
    }) => convertBulkOrderToOrderAction(bulkOrderId, data),
    onSuccess: (_, { bulkOrderId }) => {
      queryClient.invalidateQueries({ queryKey: ["bulk-orders"] });
      queryClient.invalidateQueries({ queryKey: ["bulk-orders", bulkOrderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
