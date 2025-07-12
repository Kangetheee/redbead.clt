export interface UserResponse {
  id: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  name: string;
  email: string;
  phone: string;
  username: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  totalSpend: number;
}

export interface UserDetail {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  isEmailVerified?: string;
  // isPhoneVerified?: string;
  isActive: boolean;
  createdAt: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}
