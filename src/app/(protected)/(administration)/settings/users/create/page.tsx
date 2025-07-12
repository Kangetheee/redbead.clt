import { Metadata } from "next";

import PermissionGate from "@/components/permissions/permission.gate";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { getSession } from "@/lib/session/session";

import CreateUserForm from "./create-user-form";

export const metadata: Metadata = {
  title: "Create User",
};

export default async function CreateUserPage() {
  const session = await getSession();

  return (
    <div className="space-y-4">
      <BreadcrumbNav
        title="Create User"
        items={[
          { title: "Settings", href: "/settings" },
          { title: "Users", href: "/settings/users" },
        ]}
      />

      <div className="space-y-8 rounded-lg border border-dashed p-2 shadow-sm md:p-8">
        <div className="w-full space-y-6">
          <PermissionGate session={session} permissions={["User:create"]}>
            <CreateUserForm canCreate />
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
