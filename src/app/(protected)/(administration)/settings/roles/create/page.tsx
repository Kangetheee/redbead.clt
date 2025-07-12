import { Metadata } from "next";

import PermissionGate from "@/components/permissions/permission.gate";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { findAllModulesAction } from "@/lib/roles/role.actions";
import { getSession } from "@/lib/session/session";

import CreateRoleForm from "./create-role-form";

export const metadata: Metadata = {
  title: "Create Role",
};

export default async function CreateRolePage() {
  const session = await getSession();

  const res = await findAllModulesAction();

  const modules = res.success ? res.data : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <BreadcrumbNav
          title="Create Role"
          items={[
            { title: "Settings", href: "/settings" },
            { title: "Roles", href: "/settings/roles" },
          ]}
        />
      </div>

      <PermissionGate
        session={session}
        permissions={["Role:create"]}
        requireAll
      >
        <div className="flex flex-1 rounded-lg border border-dashed p-2 shadow-sm md:p-8">
          <div className="w-full space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">Create Role</h3>

            <CreateRoleForm modules={modules} canCreate />
          </div>
        </div>
      </PermissionGate>
    </div>
  );
}
