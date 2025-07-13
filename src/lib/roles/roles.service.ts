import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import { CreateRoleDto, GetRolesDto, UpdateRoleDto } from "./dto/roles.dto";
import {
  Module,
  PermissionAction,
  RoleDetailsResponse,
  RoleResponse,
  Subject,
} from "./types/roles.types";

export class RoleService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(params?: GetRolesDto) {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/roles${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<RoleResponse>>(url);
  }

  public async findById(roleId: string) {
    return this.fetcher.request<RoleDetailsResponse>(`/v1/roles/${roleId}`);
  }

  public async create(values: CreateRoleDto) {
    return this.fetcher.request<RoleDetailsResponse>("/v1/roles", {
      method: "POST",
      data: values,
    });
  }

  public async update(roleId: string, values: UpdateRoleDto) {
    return this.fetcher.request<RoleDetailsResponse>(`/v1/roles/${roleId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async delete(roleId: string) {
    return this.fetcher.request(`/v1/roles/${roleId}`, {
      method: "DELETE",
    });
  }

  public async findAllModules() {
    return this.fetcher.request<Module[]>("/v1/roles/modules");
  }

  public async findAllSubjects() {
    return this.fetcher.request<Subject[]>("/v1/roles/subjects");
  }

  public async findAllActions() {
    return this.fetcher.request<PermissionAction[]>("/v1/roles/actions");
  }
}
