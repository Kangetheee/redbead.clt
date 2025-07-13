import { Permission } from "@/lib/roles/types/permission.type";
import { getSession } from "@/lib/session/session";
import { Session } from "@/lib/session/session.types";

const SUPER_ADMIN = ["Admin"];

export function isSuperAdmin(role?: string): boolean {
  return (role && SUPER_ADMIN.includes(role)) || false;
}

export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission,
  role?: string
): boolean {
  if (isSuperAdmin(role)) return true;
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[],
  role?: string
): boolean {
  if (isSuperAdmin(role)) return true;
  return requiredPermissions.some((permission) =>
    hasPermission(userPermissions, permission)
  );
}

export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[],
  role?: string
): boolean {
  if (isSuperAdmin(role)) return true;
  return requiredPermissions.every((permission) =>
    hasPermission(userPermissions, permission)
  );
}

export function getPermissions(session: Session | null) {
  let userRole: string | undefined;
  let userModules: Permission[] = [];

  if (session) {
    const { role, permissions } = session.user;
    userRole = role;
    userModules = permissions ?? [];
  }

  return {
    hasPermission: (requiredPermission: Permission) =>
      hasPermission(userModules, requiredPermission, userRole),
    hasAnyPermission: (requiredPermissions: Permission[]) =>
      hasAnyPermission(userModules, requiredPermissions, userRole),
    hasAllPermissions: (requiredPermissions: Permission[]) =>
      hasAllPermissions(userModules, requiredPermissions, userRole),
    isSuperAdmin: () => isSuperAdmin(userRole),
    permissions: userModules,
    roleType: userRole,
  };
}

export async function getPermissionsAsync() {
  const session = await getSession();

  const { role, permissions = [] } = session?.user ?? {};

  return {
    hasPermission: (requiredPermission: Permission) =>
      hasPermission(permissions, requiredPermission, role),
    hasAnyPermission: (requiredPermissions: Permission[]) =>
      hasAnyPermission(permissions, requiredPermissions, role),
    hasAllPermissions: (requiredPermissions: Permission[]) =>
      hasAllPermissions(permissions, requiredPermissions, role),
    isSuperAdmin: () => isSuperAdmin(role),
    permissions,
    roleType: role,
  };
}

export async function withPermission(permission: Permission): Promise<boolean> {
  const { hasPermission } = await getPermissionsAsync();
  return hasPermission(permission);
}

export async function withAnyPermission(
  permissions: Permission[]
): Promise<boolean> {
  const { hasAnyPermission } = await getPermissionsAsync();
  return hasAnyPermission(permissions);
}

export async function withAllPermissions(
  permissions: Permission[]
): Promise<boolean> {
  const { hasAllPermissions } = await getPermissionsAsync();
  return hasAllPermissions(permissions);
}

export async function withSuperAdminPermissions(
  role?: string
): Promise<boolean> {
  return isSuperAdmin(role);
}
