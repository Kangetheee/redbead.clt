export type Meta = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
};

export type PaginatedData<T> = {
  meta: Meta;
  items: T[];
};

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type Meta1 = {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  customizationAdjustments: number;
  total: number;
};

export type PaginatedData1<T> = {
  meta: Meta1;
  summary: T[];
};

export type Meta4 = {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
};

export type PaginatedData4<T> = {
  meta: Meta;
  data: T[];
};
