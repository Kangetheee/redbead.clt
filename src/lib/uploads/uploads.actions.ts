"use server";

import { getErrorMessage } from "../get-error-message";
import { ActionResponse } from "../shared/types";
import { CreateUploadFolderDto } from "./dto/create-upload-folder.dto";
import { CreateUploadDto } from "./dto/create-upload.dto";
import { UpdateUploadDto } from "./dto/update-upload.dto";
import { uploadService } from "./uploads.service";

export async function createUploadFolderAction(data: CreateUploadFolderDto) {
  try {
    const res = await uploadService.createFolder(data);
    return { success: true as const, ...res };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function getUploadFoldersAction(query?: string) {
  try {
    const uploads = await uploadService.getUploadFolders(query);
    return { success: true as const, data: uploads };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

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

export async function getUploadFolderDetailsAction(id: string, query?: string) {
  try {
    const uploads = await uploadService.getUploadFolderDetails(id, query);
    return { success: true as const, data: uploads };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function createUploadAction(data: CreateUploadDto) {
  try {
    const res = await uploadService.create(data);
    return { status: "success" as const, ...res };
  } catch (error) {
    return { status: "error" as const, message: getErrorMessage(error) };
  }
}

export async function getUploadAction(id: string) {
  try {
    const data = await uploadService.findOne(id);
    return { status: "success" as const, data };
  } catch (error) {
    return { status: "error" as const, message: getErrorMessage(error) };
  }
}

export async function getUploadsAction(query?: string) {
  try {
    const uploads = await uploadService.getUploads(query);
    return { status: "success" as const, data: uploads };
  } catch (error) {
    return { status: "error" as const, message: getErrorMessage(error) };
  }
}

export async function updateUploadAction(id: string, data: UpdateUploadDto) {
  try {
    const res = await uploadService.update(id, data);
    return { status: "success" as const, ...res };
  } catch (error) {
    return { status: "error" as const, message: getErrorMessage(error) };
  }
}

export async function deleteMediaAction(id: string) {
  try {
    const res = await uploadService.remove(id);
    return { success: true as const, ...res };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}
