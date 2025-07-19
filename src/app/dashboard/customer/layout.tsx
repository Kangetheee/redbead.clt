/* eslint-disable @typescript-eslint/no-unused-vars */

import { ReactNode } from "react";

import { getPermissionsAsync } from "@/components/permissions/permission.utils";
import { navGroups } from "@/components/layouts/dashboard/data/nav.data";
import Footer from "@/components/layouts/dashboard/footer";
import Header from "@/components/layouts/dashboard/header";
import filterNavGroups from "@/components/layouts/dashboard/nav.permissions";

type Props = Readonly<{ children: ReactNode }>;

export default async function CustomerDashboardLayout({ children }: Props) {
  const { hasAnyPermission } = await getPermissionsAsync();
  const filteredNavGroups = filterNavGroups(navGroups, hasAnyPermission);

  return (
    <>
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="h-full p-4 md:p-6 lg:p-8">{children}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
