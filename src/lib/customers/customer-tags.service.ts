import { Fetcher } from "../api/api.service";
import {
  CreateCustomerTagDto,
  UpdateCustomerTagDto,
} from "./dto/customer-tag.dto";
import { CustomerTag } from "./types/customer-tags.types";

export class CustomerTagsService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll() {
    return this.fetcher.request<CustomerTag[]>("/v1/customer-tags");
  }

  public async findById(tagId: string) {
    return this.fetcher.request<CustomerTag>(`/v1/customer-tags/${tagId}`);
  }

  public async create(values: CreateCustomerTagDto) {
    return this.fetcher.request<CustomerTag>("/v1/customer-tags", {
      method: "POST",
      data: values,
    });
  }

  public async update(tagId: string, values: UpdateCustomerTagDto) {
    return this.fetcher.request<CustomerTag>(`/v1/customer-tags/${tagId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async delete(tagId: string) {
    return this.fetcher.request<{ message: string }>(
      `/v1/customer-tags/${tagId}`,
      {
        method: "DELETE",
      }
    );
  }
}
