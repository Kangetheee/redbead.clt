/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DesignTemplate {
  id: string;
  name: string;
  description?: string;
  previewImage: string;
  customizations: any;
  productId: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDesignTemplates {
  items: DesignTemplate[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}
