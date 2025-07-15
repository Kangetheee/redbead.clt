export interface RoleResponse {
  id: string;
  name: string;
  description: string;
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
  actions: ModuleAction[];
}

export interface ModuleAction {
  name: string;
  description: string;
}

export interface Subject {
  name: string;
  description: string;
}

export interface PermissionAction {
  subject: string;
  description: string;
  permissions: PermissionDetails[];
}

export interface PermissionDetails {
  subject: string;
  action: string;
  description: string;
  dependencies?: {
    action: string;
    subject: string;
  }[];
}

export interface RoleModule {
  subject: string;
  description: string;
  actions: {
    name: string;
    description: string;
  }[];
}
