import { Metadata } from "next";
import Link from "next/link";

import { Plus } from "lucide-react";

import PermissionGate from "@/components/permissions/permission.gate";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { Button } from "@/components/ui/button";
import { getRolesAction } from "@/lib/roles/role.actions";
import { getSession } from "@/lib/session/session";

import UsersTable from "./users-table";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  const session = await getSession();
  const roleResponse = await getRolesAction();

  const roles = roleResponse.success ? roleResponse.data.results : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <BreadcrumbNav
          title="Users"
          items={[{ title: "Settings", href: "/settings" }]}
        />
      </div>

      <div className="flex flex-1 rounded-lg border border-dashed p-2 shadow-sm md:p-8">
        <div className="w-full space-y-4">
          <h3 className="text-2xl font-bold tracking-tight">Admin Users</h3>

          <div className="flex items-center justify-end gap-2">
            <PermissionGate session={session} permissions={["User:create"]}>
              <Button asChild>
                <Link className="" href="/settings/users/create">
                  <Plus className="mr-2" /> New User
                </Link>
              </Button>
            </PermissionGate>
          </div>

          <PermissionGate session={session} permissions={["User:read"]}>
            <UsersTable roles={roles} />
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
