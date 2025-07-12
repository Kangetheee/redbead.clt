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
  createdAt: string;
  updatedAt: string;
  uploadedBy: { id: string; name: string };
};

export type Upload = {
  name: string;
  type: MediaTypeEnum;
  src?: string;
  folder: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string;
  };
};

export type UploadDetail = {
  id: string;
};
