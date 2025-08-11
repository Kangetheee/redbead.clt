export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  metadata?: {
    allowedOptions?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithRelations extends CategoryResponse {
  parent?: CategorySummary;
  children: CategorySummary[];
  productCount: number;
}

export interface CategoryTreeResponse extends CategoryResponse {
  productCount: number;
  children: CategoryTreeResponse[];
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  images: string[];
  isActive: boolean;
}

export interface CategoryDetail extends CategoryWithRelations {
  products: ProductSummary[];
}

// API-specific pagination response structure
export interface PaginatedCategoriesResponse {
  items: CategoryWithRelations[];
  meta: {
    pageCount: number;
    pageSize: number;
    currentPage: number;
    pageIndex: number;
    itemCount: number;
  };
}
