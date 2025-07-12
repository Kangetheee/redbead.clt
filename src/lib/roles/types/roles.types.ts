export interface RoleResponse {
  id: string;
  name: string;
  description: null;
  isSystem: boolean;
  permissionCount: number;
}

export interface RoleDetailsResponse {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  subject: string;
  description: string;
  actions: Action[];
}

interface Action {
  name: string;
  description: string;
}
