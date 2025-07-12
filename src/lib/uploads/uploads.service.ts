import { Fetcher } from "../api/api.service";
import { Meta, PaginatedData } from "../shared/types";
import { CreateUploadFolderDto } from "./dto/create-upload-folder.dto";
import { CreateUploadDto } from "./dto/create-upload.dto";
import { UpdateUploadDto } from "./dto/update-upload.dto";
import {
  FolderUpload,
  Upload,
  UploadDetail,
  UploadFolder,
} from "./types/uploads.types";

class UploadService {
  constructor(private fetcher = new Fetcher()) {}

  async createFolder(data: CreateUploadFolderDto) {
    return await this.fetcher.request<{ id: string }>("/v1/uploads/folders", {
      data,
      method: "POST",
    });
  }

  async deleteFolder(folderId: string) {
    return await this.fetcher.request<{ id: string }>(
      `/v1/uploads/folders/${folderId}`,
      { method: "DELETE" }
    );
  }

  async getUploadFolders(query?: string) {
    return await this.fetcher.request<PaginatedData<UploadFolder>>(
      `/v1/uploads/folders${query ? `?${query}` : ""}`
    );
  }

  async getUploadFolderDetails(id: string, query?: string) {
    return await this.fetcher.request<{ meta: Meta; results: FolderUpload }>(
      `/v1/uploads/folders/${id}${query ? `?${query}` : ""}`
    );
  }

  async create(data: CreateUploadDto) {
    return await this.fetcher.request<{ id: string; url: string; src: string }>(
      "/v1/uploads",
      { data, method: "POST" }
    );
  }

  async findOne(id: string) {
    return await this.fetcher.request<UploadDetail>(`/v1/uploads/${id}`);
  }

  async getUploads(query?: string) {
    return await this.fetcher.request<PaginatedData<Upload>>(
      `/v1/uploads${query ? `?${query}` : ""}`
    );
  }

  async update(id: string, data: UpdateUploadDto) {
    return await this.fetcher.request<{ id: string; slug: string }>(
      `/v1/uploads/${id}`,
      { data, method: "PATCH" }
    );
  }

  async remove(id: string) {
    return await this.fetcher.request<{ message: string }>(
      `/v1/uploads/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
  }
}

export const uploadService = new UploadService();
