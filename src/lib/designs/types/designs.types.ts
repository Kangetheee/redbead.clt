/* eslint-disable @typescript-eslint/no-explicit-any */

import { CanvasData } from "@/lib/design-studio/types/design-studio.types";
// import { PrintSpecifications } from "@/lib/design-studio/types/design-studio.types";

export interface Design {
  id: string;
  name: string;
  description?: string;
  preview: string;
  customizations: CanvasData;
  metadata?: Record<string, any>;
  product: {
    id: string;
    name: string;
    thumbnail: string;
  };
  status: string;
  version: number;
  parentDesignId?: string;
  // printSpecifications?: PrintSpecifications;
  estimatedCost?: number;
  isTemplate: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDesigns {
  items: Design[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}
