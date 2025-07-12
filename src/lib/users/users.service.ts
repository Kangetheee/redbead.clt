import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import { CreateUserDto, UpdateUserDto } from "./dto/users.dto";
import { UserDetail, UserResponse } from "./types/users.types";

export class UserService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(query?: string) {
    return this.fetcher.request<PaginatedData<UserResponse>>(
      `/v1/users${query ? `?${query}` : ""}`
    );
  }

  public async findById(roleId: string) {
    return this.fetcher.request<UserDetail>(`/v1/users/${roleId}`);
  }

  public async create(values: CreateUserDto) {
    await this.fetcher.request("/v1/users", { method: "POST", data: values });
  }

  public async delete(roleId: string) {
    await this.fetcher.request(`/v1/users/${roleId}`, { method: "DELETE" });
  }

  public async update(roleId: string, values: UpdateUserDto) {
    await this.fetcher.request(`/v1/users/${roleId}`, {
      method: "PATCH",
      data: values,
    });
  }
}
