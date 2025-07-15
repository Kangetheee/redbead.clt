import { ReactNode } from "react";

import { getPermissionsAsync } from "@/components/permissions/permission.utils";

import { navGroups } from "@/components/layouts/dashboard/data/nav.data";
import Footer from "@/components/layouts/dashboard/footer";
import Header from "@/components/layouts/dashboard/header";
import MainMenu from "@/components/layouts/dashboard/main-menu";
import filterNavGroups from "@/components/layouts/dashboard/nav.permissions";

type Props = Readonly<{ children: ReactNode }>;

export default async function CustomerDashboardLayout({ children }: Props) {
  const { hasAnyPermission } = await getPermissionsAsync();
  const filteredNavGroups = filterNavGroups(navGroups, hasAnyPermission);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Fixed position */}
      <MainMenu 
        className="hidden md:flex md:flex-col md:w-72 md:fixed md:inset-y-0 md:z-50" 
        navGroups={filteredNavGroups} 
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:ml-72 overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="h-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}