import { Fetcher } from "../api/api.service";
import {
  CreateAddressDto,
  UpdateAddressDto,
  GetAddressesDto,
} from "./dto/address.dto";
import {
  AddressResponse,
  AddressType,
  PaginatedAddressesResponse,
} from "./types/address.types";

export class AddressService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Get paginated list of addresses for the current user
   * Uses GET /v1/addresses
   */
  async findAll(params?: GetAddressesDto): Promise<PaginatedAddressesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/addresses${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedAddressesResponse>(url, {
      method: "GET",
    });
  }

  /**
   * Get a specific address by ID
   * Uses GET /v1/addresses/{id}
   */
  async findById(addressId: string): Promise<AddressResponse> {
    return this.fetcher.request<AddressResponse>(`/v1/addresses/${addressId}`, {
      method: "GET",
    });
  }

  /**
   * Get the default address for a specific type
   * Uses GET /v1/addresses/default/{type}
   */
  async findDefaultByType(type: AddressType): Promise<AddressResponse> {
    return this.fetcher.request<AddressResponse>(
      `/v1/addresses/default/${type}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Create a new address for the current user
   * Uses POST /v1/addresses
   */
  async create(values: CreateAddressDto): Promise<AddressResponse> {
    return this.fetcher.request<AddressResponse>("/v1/addresses", {
      method: "POST",
      data: values,
    });
  }

  /**
   * Update an address
   * Uses PATCH /v1/addresses/{id}
   */
  async update(
    addressId: string,
    values: UpdateAddressDto
  ): Promise<AddressResponse> {
    return this.fetcher.request<AddressResponse>(`/v1/addresses/${addressId}`, {
      method: "PATCH",
      data: values,
    });
  }

  /**
   * Delete an address
   * Uses DELETE /v1/addresses/{id}
   */
  async delete(addressId: string): Promise<void> {
    return this.fetcher.request<void>(`/v1/addresses/${addressId}`, {
      method: "DELETE",
    });
  }

  /**
   * Set an address as default for its type
   * Uses PATCH /v1/addresses/{id}/set-default
   */
  async setAsDefault(addressId: string): Promise<AddressResponse> {
    return this.fetcher.request<AddressResponse>(
      `/v1/addresses/${addressId}/set-default`,
      {
        method: "PATCH",
        data: {},
      }
    );
  }
}
