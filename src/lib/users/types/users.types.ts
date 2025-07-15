export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  avatar?: string | null;
  isActive: boolean;
  createdAt: string;
  totalSpend?: number;
  role: UserRole;
  roles_users_roleIdToroles: UserRole; // Legacy field from API
}

export interface UserDetail {
  id: string;
  avatar?: string | null;
  name: string;
  email: string;
  phone: string;
  username?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isActive: boolean;
  createdAt: string;
  verified?: boolean;
  role: UserRole;
  roles_users_roleIdToroles?: UserRole; // Legacy field from API
}

export interface UserProfile {
  id: string;
  avatar?: string | null;
  name: string;
  phone: string;
  isActive: boolean;
  email: string;
  createdAt: string;
  passwordHash?: string;
  verified: boolean;
  roles_users_roleIdToroles: UserRole;
}

// For form components and select options
export interface UserOption {
  value: string;
  label: string;
  role?: string;
}

// For user filters
export interface UserFilters {
  search?: string;
  roleId?: string;
  isActive?: boolean;
}
