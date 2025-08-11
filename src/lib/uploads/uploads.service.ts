/* eslint-disable @typescript-eslint/no-unused-vars */
import { Fetcher } from "../api/api.service";
import { Meta, PaginatedData, PaginatedData1 } from "../shared/types";
import { CreateUploadFolderDto } from "./dto/create-upload-folder.dto";
import { CreateUploadDto } from "./dto/create-upload.dto";
import { UpdateUploadDto } from "./dto/update-upload.dto";
import { MediaTypeEnum } from "./enums/uploads.enum";
import {
  FolderUpload,
  Upload,
  UploadDetail,
  UploadFolder,
  UploadResponse,
} from "./types/uploads.types";

class UploadService {
  constructor(private fetcher = new Fetcher()) {}

  /**
   * Create a new upload folder
   * POST /v1/uploads/folders
   */
  async createFolder(data: CreateUploadFolderDto) {
    return await this.fetcher.request<{ id: string }>("/v1/uploads/folders", {
      data,
      method: "POST",
    });
  }

  /**
   * Delete a folder
   * DELETE /v1/uploads/folders/{id}
   */
  async deleteFolder(folderId: string) {
    return await this.fetcher.request<{ id: string }>(
      `/v1/uploads/folders/${folderId}`,
      { method: "DELETE" }
    );
  }

  /**
   * Get all upload folders
   * GET /v1/uploads/folders
   */
  async getUploadFolders(query?: string) {
    return await this.fetcher.request<PaginatedData1<UploadFolder>>(
      `/v1/uploads/folders${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get folder details with media
   * GET /v1/uploads/folders/{id}
   */
  async getUploadFolderDetails(id: string, query?: string) {
    return await this.fetcher.request<{ meta: Meta; results: FolderUpload }>(
      `/v1/uploads/folders/${id}${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get upload details
   * GET /v1/uploads/{id}
   */
  async findOne(id: string) {
    return await this.fetcher.request<UploadDetail>(`/v1/uploads/${id}`);
  }

  /**
   * Get file content
   * GET /v1/uploads/{id}/file
   */
  async getFile(id: string) {
    return await this.fetcher.request<Blob>(`/v1/uploads/${id}/file`);
  }

  /**
   * Get all uploads
   * GET /v1/uploads
   */
  async getUploads(query?: string) {
    return await this.fetcher.request<PaginatedData1<Upload>>(
      `/v1/uploads${query ? `?${query}` : ""}`
    );
  }

  /**
   * Update upload details
   * PATCH /v1/uploads/{id}
   */
  async update(id: string, data: UpdateUploadDto) {
    return await this.fetcher.request<{ id: string; src: string }>(
      `/v1/uploads/${id}`,
      { data, method: "PATCH" }
    );
  }

  /**
   * Delete an upload
   * DELETE /v1/uploads/{id}
   */
  async remove(id: string) {
    return await this.fetcher.request<{ message: string }>(
      `/v1/uploads/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Create upload (JSON data)
   * POST /v1/uploads
   */
  async create(data: CreateUploadDto) {
    return await this.fetcher.request<UploadResponse>("/v1/uploads", {
      data,
      method: "POST",
    });
  }

  /**
   * Upload file with FormData
   * POST /v1/uploads
   */
  async uploadFile(formData: FormData) {
    return await this.fetcher.request<UploadResponse>("/v1/uploads", {
      data: formData,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export const uploadService = new UploadService();
