import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import { CreateRoleDto } from "./dto/roles.dto";
import { Module, RoleDetailsResponse, RoleResponse } from "./types/roles.types";

export class RoleService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll() {
    return this.fetcher.request<PaginatedData<RoleResponse>>("/v1/roles");
  }

  public async findById(roleId: string) {
    return this.fetcher.request<RoleDetailsResponse>(`/v1/roles/${roleId}`);
  }

  public async create(values: CreateRoleDto) {
    await this.fetcher.request("/v1/roles", { method: "POST", data: values });
  }

  public async delete(roleId: string) {
    await this.fetcher.request(`/v1/roles/${roleId}`, { method: "DELETE" });
  }

  public async update(roleId: string, values: CreateRoleDto) {
    await this.fetcher.request(`/v1/roles/${roleId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async findAllModules() {
    return this.fetcher.request<Module[]>("/v1/roles/modules");
  }
}
