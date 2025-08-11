/* eslint-disable @typescript-eslint/no-explicit-any */
import { MediaTypeEnum } from "../enums/uploads.enum";

export type UploadFolder = {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FolderUpload = {
  id: string;
  name: string;
  media: Media[];
};

export type Media = {
  id: string;
  name: string;
  src: string;
  type: MediaTypeEnum;
  size: number;
  originalName?: string;
  mimeType?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  uploadedBy: { id: string; name: string };
};

export type Upload = {
  id: string;
  name: string;
  type: MediaTypeEnum;
  src?: string;
  folderId: string;
  folder?: string;
  size: number;
  originalName?: string;
  mimeType?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
};

export type UploadDetail = {
  id: string;
  name: string;
  type: MediaTypeEnum;
  src: string;
  folderId: string;
  size: number;
  originalName?: string;
  mimeType?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
};

export type UploadResponse = {
  id: string;
  src: string;
};
