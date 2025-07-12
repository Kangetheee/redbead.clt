import { ReactNode } from "react";

import { getPermissionsAsync } from "@/components/permissions/permission.utils";

import { navGroups } from "./data/nav.data";
import Footer from "./footer";
import Header from "./header";
import MainMenu from "./main-menu";
import filterNavGroups from "./nav.permissions";

type Props = Readonly<{ children: ReactNode }>;

export default async function DashboardLayout({ children }: Props) {
  const { hasAnyPermission } = await getPermissionsAsync();
  const filteredNavGroups = filterNavGroups(navGroups, hasAnyPermission);

  return (
    <div className="min-h-screen">
      <MainMenu className="hidden md:block" navGroups={filteredNavGroups} />

      <div className="transition md:ml-72">
        <Header />
        <main className="min-h-[calc(100vh-120px)] p-4 md:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
