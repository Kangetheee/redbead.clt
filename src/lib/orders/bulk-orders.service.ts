/* eslint-disable @typescript-eslint/no-explicit-any */

import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import { BulkOrderConversionDto } from "./dto/bulk-convert.dto";
import {
  CreateBulkOrderDto,
  UpdateBulkOrderDto,
  GetBulkOrdersDto,
} from "./dto/bulk-order.dto";
import { CreateBulkOrderQuoteDto } from "./dto/bulk-quote.dto";
import { BulkOrderDetail, BulkOrderResponse } from "./types/bulk-orders.types";

export class BulkOrderService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(
    params?: GetBulkOrdersDto
  ): Promise<PaginatedData<BulkOrderResponse>> {
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
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const url = `/v1/bulk-orders${queryString ? `?${queryString}` : ""}`;

    // Get the raw API response
    const apiResponse = await this.fetcher.request<{
      data: BulkOrderResponse[];
      meta: {
        page: number;
        limit: number;
        total: number;
        lastPage: number;
      };
      links?: any;
    }>(url);

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

  public async findById(bulkOrderId: string) {
    return this.fetcher.request<BulkOrderDetail>(
      `/v1/bulk-orders/${bulkOrderId}`
    );
  }

  public async create(values: CreateBulkOrderDto) {
    return this.fetcher.request<BulkOrderDetail>("/v1/bulk-orders", {
      method: "POST",
      data: values,
    });
  }

  public async update(bulkOrderId: string, values: UpdateBulkOrderDto) {
    return this.fetcher.request<BulkOrderDetail>(
      `/v1/bulk-orders/${bulkOrderId}`,
      {
        method: "PATCH",
        data: values,
      }
    );
  }

  public async delete(bulkOrderId: string) {
    return this.fetcher.request<{ message: string }>(
      `/v1/bulk-orders/${bulkOrderId}`,
      {
        method: "DELETE",
      }
    );
  }

  public async createQuote(
    bulkOrderId: string,
    values: CreateBulkOrderQuoteDto
  ) {
    return this.fetcher.request<BulkOrderDetail>(
      `/v1/bulk-orders/${bulkOrderId}/quote`,
      {
        method: "POST",
        data: values,
      }
    );
  }

  public async acceptQuote(bulkOrderId: string) {
    return this.fetcher.request<BulkOrderDetail>(
      `/v1/bulk-orders/${bulkOrderId}/accept-quote`,
      {
        method: "POST",
        data: {},
      }
    );
  }

  public async convertToOrder(
    bulkOrderId: string,
    values: BulkOrderConversionDto
  ) {
    return this.fetcher.request<BulkOrderDetail>(
      `/v1/bulk-orders/${bulkOrderId}/convert-to-order`,
      {
        method: "POST",
        data: values,
      }
    );
  }
}
