import { ReactNode } from "react";

import { Permission } from "@/lib/roles/types/permission.type";
import { Session } from "@/lib/session/session.types";

import { getPermissions } from "./permission.utils";

// type RedirectBehavior = "back" | "404" | { path: Route };

type Props = {
  session: Session | null;
  children: ReactNode;
  permissions: Permission[];
  superAdmin?: boolean;
  fallback?: ReactNode;
  requireAll?: boolean;
  // /**
  //  * Redirect behavior when access is denied:
  //  * - 'back': Returns to previous page
  //  * - '404': Redirects to 404 page
  //  * - { path: '/custom-path' }: Redirects to specified path
  //  */
  // redirect?: RedirectBehavior;
};

export default function PermissionGate({
  children,
  permissions,
  superAdmin = false,
  fallback = null,
  requireAll = false,
  session,
}: Props) {
  const { hasAnyPermission, hasAllPermissions, isSuperAdmin } =
    getPermissions(session);

  if (superAdmin) return isSuperAdmin() ? children : fallback;

  if (!permissions.length) return children;

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return hasAccess ? children : fallback;
}
