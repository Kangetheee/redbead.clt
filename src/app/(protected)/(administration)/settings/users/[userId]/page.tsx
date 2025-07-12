import { Metadata } from "next";
import { notFound } from "next/navigation";

import PermissionGate from "@/components/permissions/permission.gate";
import { getPermissions } from "@/components/permissions/permission.utils";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { getSession } from "@/lib/session/session";
import { CreateUserDto } from "@/lib/users/dto/users.dto";
import { getUserAction } from "@/lib/users/users.actions";

import CreateUserForm from "../create/create-user-form";

export const metadata: Metadata = {
  title: "User Details",
};

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function UpdateUserPage({ params }: Props) {
  const session = await getSession();
  const { userId } = await params;

  const res = await getUserAction(userId);

  if (!res.success) return notFound();

  const defaultValues: CreateUserDto = {
    name: res.data.name ?? "",
    email: res.data.email ?? "",
    phone: res.data.phone ?? "",
    username: res.data.username ?? "",
    roleId: res.data.role.id ?? "",
    isActive: res.data.isActive ?? true,
    password: "",
    confirmPassword: "",
  };

  const { hasPermission } = getPermissions(session);

  return (
    <div className="space-y-4">
      <BreadcrumbNav
        title="User Details"
        items={[
          { title: "Settings", href: "/settings" },
          { title: "Users", href: "/settings/users" },
        ]}
      />

      <div className="space-y-8 rounded-lg border border-dashed p-2 shadow-sm md:p-8">
        <div className="w-full space-y-6">
          <PermissionGate session={session} permissions={["User:read"]}>
            <CreateUserForm
              update={{ defaultValues, userId }}
              canUpdate={hasPermission("User:update")}
            />
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
