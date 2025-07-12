import { Metadata } from "next";

import PermissionGate from "@/components/permissions/permission.gate";
import BreadcrumbNav from "@/components/ui/breadcrumb-nav";
import { getSession } from "@/lib/session/session";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default async function Page() {
  const session = await getSession();

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <BreadcrumbNav
          title="Audit Logs"
          items={[{ title: "Settings", href: "/settings" }]}
        />
      </div>

      <div className="flex flex-1 rounded-lg border border-dashed p-2 shadow-sm md:p-8">
        <div className="w-full space-y-4">
          <h3 className="text-2xl font-bold tracking-tight">Audit Logs</h3>

          <PermissionGate session={session} permissions={["AuditTrail:read"]}>
            <p className="">Audit Logs</p>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
