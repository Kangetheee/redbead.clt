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
