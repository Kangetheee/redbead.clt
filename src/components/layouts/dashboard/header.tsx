import { Bell } from "lucide-react";

import { getPermissionsAsync } from "@/components/permissions/permission.utils";

import { Button } from "../../ui/button";
import AccountDropdown from "./account-dropdown";
import { navGroups } from "./data/nav.data";
import MobileMenu from "./mobile-menu";
import filterNavGroups from "./nav.permissions";
import SearchBar from "./search-bar";

export default async function Header() {
  const { hasAnyPermission } = await getPermissionsAsync();
  const filteredNavGroups = filterNavGroups(navGroups, hasAnyPermission);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-gray-300 bg-muted/40 px-4 backdrop-blur-sm backdrop-filter dark:border-gray-700 lg:h-[60px] lg:px-6">
      <MobileMenu navGroups={filteredNavGroups} />

      <SearchBar />

      <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </Button>

      <AccountDropdown />
    </header>
  );
}
