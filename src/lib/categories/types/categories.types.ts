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
  metaTitle?: string;
  metaDescription?: string;
  thumbnailImage?: string;
  bannerImage?: string;
  configSchema?: object;
  isActive: boolean;
  sortOrder: number;
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
  thumbnailImage?: string;
  basePrice: number;
  isFeatured: boolean;
}

export interface CustomizationOptionValue {
  id: string;
  value: string;
  displayName: string;
  description?: string;
  priceAdjustment: number;
  sortOrder: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type:
    | "DROPDOWN"
    | "COLOR_PICKER"
    | "TEXT_INPUT"
    | "FILE_UPLOAD"
    | "NUMBER_INPUT"
    | "CHECKBOX"
    | "RADIO";
  required: boolean;
  sortOrder: number;
  values: CustomizationOptionValue[];
}

export interface CategoryDetail extends CategoryWithRelations {
  products: ProductSummary[];
  customOptions: CustomizationOption[];
}

export interface CategoryFilters {
  search?: string;
  isActive?: boolean;
}

// Categories-specific pagination types
export interface CategoryMeta {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface CategoryPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface CategoryPaginatedData<T> {
  items: T[];
  meta: CategoryMeta;
  links: CategoryPaginationLinks;
}
