import { ReactNode } from "react";
import { Permission } from "@/lib/roles/types/permission.type";
import { Session } from "@/lib/session/session.types";
import { getPermissions } from "./permission.utils";

interface PermissionGateProps {
  session: Session | null;
  children: ReactNode;
  permissions?: Permission[];
  permission?: Permission;
  superAdmin?: boolean;
  fallback?: ReactNode;
  requireAll?: boolean;

  // Subject-specific checks
  subject?: string;
  action?: "create" | "read" | "update" | "delete";

  // Role checks
  role?: "Admin" | "Staff" | "Customer";
  roles?: ("Admin" | "Staff" | "Customer")[];
}

export function PermissionGate({
  session,
  children,
  permissions = [],
  permission,
  superAdmin = false,
  fallback = null,
  requireAll = false,
  subject,
  action,
  role,
  roles,
}: PermissionGateProps) {
  const {
    hasAnyPermission,
    hasAllPermissions,
    hasPermission,
    isSuperAdmin,
    roleType,
  } = getPermissions(session);

  // Super admin check
  if (superAdmin) {
    return isSuperAdmin() ? children : fallback;
  }

  // Role-based access
  if (role && roleType !== role) {
    return <>{fallback}</>;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (roles && roleType && !roles.includes(roleType as any)) {
    return <>{fallback}</>;
  }

  // Single permission check
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Subject-action based access
  if (subject && action) {
    const requiredPermission = `${subject}:${action}` as Permission;
    if (!hasPermission(requiredPermission)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Export as default to match existing usage
export default PermissionGate;
