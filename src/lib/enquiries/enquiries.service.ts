import { Fetcher } from "../api/api.service";
import {
  CreateInquiryDto,
  CreateInquiryResponse,
  GetInquiriesParams,
  PaginatedInquiriesResponse,
} from "./types/enquiries.types";

export class EnquiriesService {
  constructor(private fetcher = new Fetcher()) {}

  async create(data: CreateInquiryDto): Promise<CreateInquiryResponse> {
    return this.fetcher.request<CreateInquiryResponse>(`/v1/enquiries`, {
      method: "POST",
      data,
    });
  }

  async getAll(
    params?: GetInquiriesParams
  ): Promise<PaginatedInquiriesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.email) queryParams.append("email", params.email);
    if (params?.phone) queryParams.append("phone", params.phone);
    if (params?.name) queryParams.append("name", params.name);
    if (params?.subject) queryParams.append("subject", params.subject);
    if (params?.contactPreference)
      queryParams.append("contactPreference", params.contactPreference);
    if (params?.bulkOrders !== undefined)
      queryParams.append("bulkOrders", params.bulkOrders.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/v1/enquiries?${queryString}` : "/v1/enquiries";

    return this.fetcher.request<PaginatedInquiriesResponse>(url, {
      method: "GET",
    });
  }

  async getAllWithQuery(query?: string): Promise<PaginatedInquiriesResponse> {
    const queryString = query ? `?${query}` : "";
    return this.fetcher.request<PaginatedInquiriesResponse>(
      `/v1/enquiries${queryString}`,
      {
        method: "GET",
      }
    );
  }
}
