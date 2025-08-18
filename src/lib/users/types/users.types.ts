export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  type: "CUSTOMER" | "ADMIN" | "MANAGER";
  isActive: boolean;
  verified: boolean;
  roleId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any> | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  type: "CUSTOMER" | "ADMIN" | "MANAGER";
  isActive: boolean;
  verified: boolean;
  roleId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any> | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  type: "CUSTOMER" | "ADMIN" | "MANAGER";
  isActive: boolean;
  verified: boolean;
  roleId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any> | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
}

// For form components and select options
export interface UserOption {
  value: string;
  label: string;
  role?: string;
  type?: string;
}

// For user filters
export interface UserFilters {
  search?: string;
  roleId?: string;
  type?: "CUSTOMER" | "ADMIN" | "MANAGER";
  isActive?: boolean;
  verified?: boolean;
}
