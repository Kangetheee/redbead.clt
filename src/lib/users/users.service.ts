import { Fetcher } from "../api/api.service";
import { PaginatedData } from "../shared/types";
import { CreateUserDto, UpdateUserDto, GetUsersDto } from "./dto/users.dto";
import { UserDetail, UserResponse, UserProfile } from "./types/users.types";

export class UserService {
  constructor(private fetcher = new Fetcher()) {}

  public async findAll(params?: GetUsersDto) {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.roleId) {
      queryParams.append("roleId", params.roleId);
    }
    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }

    const queryString = queryParams.toString();
    const url = `/v1/users${queryString ? `?${queryString}` : ""}`;

    return this.fetcher.request<PaginatedData<UserResponse>>(url);
  }

  public async findById(userId: string) {
    return this.fetcher.request<UserDetail>(`/v1/users/${userId}`);
  }

  public async create(values: CreateUserDto) {
    return this.fetcher.request<UserDetail>("/v1/users", {
      method: "POST",
      data: values,
    });
  }

  public async update(userId: string, values: UpdateUserDto) {
    return this.fetcher.request<{ message: string }>(`/v1/users/${userId}`, {
      method: "PATCH",
      data: values,
    });
  }

  public async delete(userId: string) {
    return this.fetcher.request<{ message: string }>(`/v1/users/${userId}`, {
      method: "DELETE",
    });
  }

  // Profile endpoints
  public async getProfile() {
    return this.fetcher.request<UserProfile>("/v1/users/profile");
  }

  public async updateProfile(values: UpdateUserDto) {
    return this.fetcher.request<{ message: string }>("/v1/users/profile", {
      method: "PATCH",
      data: values,
    });
  }
}
