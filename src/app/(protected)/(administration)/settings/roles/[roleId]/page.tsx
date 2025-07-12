import { Metadata } from "next";

import PermissionGate from "@/components/permissions/permission.gate";
import { getPermissions } from "@/components/permissions/permission.utils";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { findAllModulesAction, getRoleAction } from "@/lib/roles/role.actions";
import { Module } from "@/lib/roles/types/roles.types";
import { getSession } from "@/lib/session/session";

import CreateRoleForm from "../create/create-role-form";

export const metadata: Metadata = {
  title: "Create Role",
};

type Props = {
  params: Promise<{
    roleId: string;
  }>;
};

export default async function RoleDetailsPage({ params }: Props) {
  const session = await getSession();

  const roleId = (await params).roleId;

  const [roleRes, moduleRes] = await Promise.all([
    getRoleAction(roleId),
    findAllModulesAction(),
  ]);

  if (!roleRes.success) return <div>{roleRes.error}</div>;

  let modules: Module[] = [];
  if (moduleRes.success) modules = moduleRes.data;

  const { hasPermission } = getPermissions(session);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <BreadcrumbNav
          title="Role Details"
          items={[
            { title: "Settings", href: "/settings" },
            { title: "Roles", href: "/settings/roles" },
          ]}
        />
      </div>

      <PermissionGate session={session} permissions={["Role:read"]}>
        <div className="flex flex-1 rounded-lg border border-dashed p-2 shadow-sm md:p-8">
          <div className="w-full space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">Role Details</h3>

            <CreateRoleForm
              modules={modules}
              roleId={roleId}
              values={{
                name: roleRes.data.name,
                description: roleRes.data.description,
                permissions: roleRes.data.permissions,
              }}
              canUpdate={hasPermission("Role:update")}
              canDelete={hasPermission("Role:delete")}
            />
          </div>
        </div>
      </PermissionGate>
    </div>
  );
}
