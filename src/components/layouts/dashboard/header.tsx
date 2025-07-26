import { Bell } from "lucide-react";

import { Button } from "../../ui/button";
import AccountDropdown from "./account-dropdown";
import MobileMenu from "./mobile-menu";
import { customerNavItems } from "./data/customer-nav.data";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-gray-300 bg-muted/40 px-4 backdrop-blur-sm backdrop-filter dark:border-gray-700 lg:h-[60px] lg:px-6">
      {/* Mobile hamburger menu - visible only on small screens */}
      <MobileMenu />

      {/* Centered Desktop Nav */}
      <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
        {customerNavItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </nav>

      {/* Right-side buttons */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>

        <AccountDropdown />
      </div>
    </header>
  );
}
