export interface ProductTypeResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  material: string;
  images: string[];
  thumbnailImage?: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  designTemplates?: ProductTypeDesignTemplate[];
}

export interface ProductTypeDesignTemplate {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  previewImage?: string;
}

export interface ProductTypeFilters {
  categoryId?: string;
  search?: string;
  type?: string;
  material?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "sortOrder";
  sortDirection?: "asc" | "desc";
}
