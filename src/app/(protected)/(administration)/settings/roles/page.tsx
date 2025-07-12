import { Metadata } from "next";
import Link from "next/link";

import { PlusIcon } from "lucide-react";

import PermissionGate from "@/components/permissions/permission.gate";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session/session";

import RolesTable from "./roles-table";

export const metadata: Metadata = {
  title: "Roles",
};

export default async function RolesPage() {
  const session = await getSession();

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <BreadcrumbNav
          title="Roles"
          items={[{ title: "Settings", href: "/settings" }]}
        />
      </div>

      <div className="flex flex-1 rounded-lg border border-dashed p-2 shadow-sm md:p-8">
        <div className="w-full space-y-4">
          <h3 className="text-2xl font-bold tracking-tight">Roles</h3>

          <div className="flex justify-end">
            <PermissionGate session={session} permissions={["Role:create"]}>
              <Button asChild>
                <Link href="/settings/roles/create">
                  <PlusIcon className="size-4" />
                  Add Role
                </Link>
              </Button>
            </PermissionGate>
          </div>

          <PermissionGate session={session} permissions={["Role:read"]}>
            <RolesTable />
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
