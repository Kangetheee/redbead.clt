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

  public async findAll(params?: GetAddressesDto) {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/addresses${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedAddressesResponse>(url);
  }

  public async findById(addressId: string) {
    return this.fetcher.request<AddressResponse>(`/v1/addresses/${addressId}`);
  }

  public async findDefaultByType(type: AddressType) {
    return this.fetcher.request<AddressResponse>(
      `/v1/addresses/default/${type}`
    );
  }

  public async create(values: CreateAddressDto) {
    return this.fetcher.request<AddressResponse>("/v1/addresses", {
      method: "POST",
      data: values,
    });
  }

  public async update(addressId: string, values: UpdateAddressDto) {
    return this.fetcher.request<AddressResponse>(`/v1/addresses/${addressId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async delete(addressId: string) {
    return this.fetcher.request<void>(`/v1/addresses/${addressId}`, {
      method: "DELETE",
    });
  }

  public async setDefault(addressId: string) {
    return this.fetcher.request<AddressResponse>(
      `/v1/addresses/${addressId}/set-default`,
      {
        method: "PATCH",
        data: {},
      }
    );
  }
}
