/* eslint-disable @typescript-eslint/no-unused-vars */

import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
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
} from "./dto/orders.dto";
import {
  OrderResponse,
  OrderListItem,
  OrderNote,
  DesignApproval,
  OrderItem,
  PaymentStatus,
  ProductionRequirements,
  TimelineCalculation,
  OrdersListResponse,
} from "./types/orders.types";

export class OrderService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(
    params?: GetOrdersDto
  ): Promise<PaginatedData<OrderListItem>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.designApprovalStatus) {
      queryParams.append("designApprovalStatus", params.designApprovalStatus);
    }
    if (params?.minTotal) {
      queryParams.append("minTotal", params.minTotal.toString());
    }
    if (params?.maxTotal) {
      queryParams.append("maxTotal", params.maxTotal.toString());
    }
    if (params?.startDate) {
      queryParams.append("startDate", params.startDate);
    }
    if (params?.endDate) {
      queryParams.append("endDate", params.endDate);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.urgencyLevel) {
      queryParams.append("urgencyLevel", params.urgencyLevel);
    }
    if (params?.templateId) {
      queryParams.append("templateId", params.templateId);
    }

    const queryString = queryParams.toString();
    const url = `/v1/orders${queryString ? `?${queryString}` : ""}`;

    // Get the raw API response
    const apiResponse = await this.fetcher.request<OrdersListResponse>(url);

    // Transform to match PaginatedData structure
    return {
      items: apiResponse.data,
      meta: {
        totalItems: apiResponse.meta.total,
        itemsPerPage: apiResponse.meta.limit,
        currentPage: apiResponse.meta.page,
        totalPages: apiResponse.meta.lastPage,
      },
    };
  }

  public async findById(orderId: string): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}`);
  }

  public async create(values: CreateOrderDto): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>("/v1/orders", {
      method: "POST",
      data: values,
    });
  }

  public async update(
    orderId: string,
    values: UpdateOrderDto
  ): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async updateStatus(
    orderId: string,
    values: UpdateOrderStatusDto
  ): Promise<OrderResponse> {
    return this.fetcher.request<OrderResponse>(`/v1/orders/${orderId}/status`, {
      method: "PATCH",
      data: values,
    });
  }

  public async getNotes(orderId: string): Promise<OrderNote[]> {
    return this.fetcher.request<OrderNote[]>(`/v1/orders/${orderId}/notes`);
  }

  public async addNote(
    orderId: string,
    values: CreateOrderNoteDto
  ): Promise<OrderNote> {
    return this.fetcher.request<OrderNote>(`/v1/orders/${orderId}/notes`, {
      method: "POST",
      data: values,
    });
  }

  public async requestDesignApproval(
    orderId: string,
    values: RequestDesignApprovalDto
  ): Promise<DesignApproval> {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/request-design-approval`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async getDesignApproval(orderId: string): Promise<DesignApproval> {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/design-approval`
    );
  }

  public async updateDesignApproval(
    orderId: string,
    values: UpdateDesignApprovalDto
  ): Promise<DesignApproval> {
    return this.fetcher.request<DesignApproval>(
      `/v1/orders/${orderId}/design-approval`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    return this.fetcher.request<PaymentStatus>(
      `/v1/orders/${orderId}/payment-status`
    );
  }

  public async completeDesignApproval(orderId: string): Promise<void> {
    return this.fetcher.request<void>(
      `/v1/orders/${orderId}/complete-design-approval`,
      {
        method: "POST",
      }
    );
  }

  public async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.fetcher.request<OrderItem[]>(`/v1/orders/${orderId}/items`);
  }

  public async getProductionRequirements(
    orderId: string
  ): Promise<ProductionRequirements> {
    return this.fetcher.request<ProductionRequirements>(
      `/v1/orders/${orderId}/production-requirements`
    );
  }

  public async calculateTimeline(
    orderId: string,
    startDate: string
  ): Promise<TimelineCalculation> {
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", startDate);

    return this.fetcher.request<TimelineCalculation>(
      `/v1/orders/${orderId}/calculate-timeline?${queryParams.toString()}`,
      {
        method: "POST",
      }
    );
  }

  public async updateOrderItemStatus(
    orderItemId: string,
    values: UpdateOrderItemStatusDto
  ): Promise<void> {
    return this.fetcher.request<void>(`/v1/order-items/${orderItemId}/status`, {
      method: "PATCH",
      data: values,
    });
  }

  public async bulkUpdateOrderItemStatus(
    values: BulkUpdateOrderItemStatusDto
  ): Promise<void> {
    return this.fetcher.request<void>("/v1/order-items/bulk-update-status", {
      method: "POST",
      data: values,
    });
  }

  public async getOrderItemsByStatus(
    status: string,
    templateId: string
  ): Promise<OrderItem[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("templateId", templateId);

    return this.fetcher.request<OrderItem[]>(
      `/v1/order-items/by-status/${status}?${queryParams.toString()}`
    );
  }
}
