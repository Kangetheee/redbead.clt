/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { CreateUploadFolderDto } from "./dto/create-upload-folder.dto";
import { CreateUploadDto } from "./dto/create-upload.dto";
import { UpdateUploadDto } from "./dto/update-upload.dto";
import { MediaTypeEnum } from "./enums/uploads.enum";
import { uploadService } from "./uploads.service";

/**
 * Create a new upload folder
 * POST /v1/uploads/folders
 */
export async function createUploadFolderAction(data: CreateUploadFolderDto) {
  try {
    const res = await uploadService.createFolder(data);
    return { success: true as const, data: res };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Get all upload folders
 * GET /v1/uploads/folders
 */
export async function getUploadFoldersAction(query?: string) {
  try {
    const uploads = await uploadService.getUploadFolders(query);
    return { success: true as const, data: uploads };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Delete a folder
 * DELETE /v1/uploads/folders/{id}
 */
export async function deleteFolderAction(
  id: string
): Promise<ActionResponse<void>> {
  try {
    await uploadService.deleteFolder(id);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get folder details with media
 * GET /v1/uploads/folders/{id}
 */
export async function getUploadFolderDetailsAction(id: string, query?: string) {
  try {
    const uploads = await uploadService.getUploadFolderDetails(id, query);
    return { success: true as const, data: uploads };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Get upload details
 * GET /v1/uploads/{id}
 */
export async function getUploadAction(id: string) {
  try {
    const data = await uploadService.findOne(id);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Get file content
 * GET /v1/uploads/{id}/file
 */
export async function getFileAction(id: string) {
  try {
    const data = await uploadService.getFile(id);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Get all uploads
 * GET /v1/uploads
 */
export async function getUploadsAction(query?: string) {
  try {
    const uploads = await uploadService.getUploads(query);
    return { success: true as const, data: uploads };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Update upload details
 * PATCH /v1/uploads/{id}
 */
export async function updateUploadAction(id: string, data: UpdateUploadDto) {
  try {
    const res = await uploadService.update(id, data);
    return { success: true as const, data: res };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Delete an upload
 * DELETE /v1/uploads/{id}
 */
export async function deleteMediaAction(id: string) {
  try {
    const res = await uploadService.remove(id);
    return { success: true as const, data: res };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Create upload (JSON data)
 * POST /v1/uploads
 */
export async function createUploadAction(data: CreateUploadDto) {
  try {
    const res = await uploadService.create(data);
    return { success: true as const, data: res };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

/**
 * Upload file with FormData
 * POST /v1/uploads
 */
export async function uploadFileAction(formData: FormData) {
  try {
    const res = await uploadService.uploadFile(formData);
    return { success: true as const, data: res };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}
