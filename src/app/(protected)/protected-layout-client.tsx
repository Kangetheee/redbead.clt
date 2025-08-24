"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Settings,
  LayoutDashboard,
  Menu,
  ChevronRight,
  ShoppingCart,
  Palette,
} from "lucide-react";
import { Session } from "@/lib/session/session.types";

interface ProtectedLayoutClientProps {
  children: React.ReactNode;
  session: Session;
}

// Custom hook for device detection (same as navbar)
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);
    return () => window.removeEventListener("resize", checkDeviceType);
  }, []);

  return deviceType;
};

export function ProtectedLayoutClient({
  children,
  session,
}: ProtectedLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const deviceType = useDeviceType();

  const sidebarLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & analytics",
    },
    {
      href: "/orders",
      label: "My Orders",
      icon: Package,
      description: "Track your orders",
    },
    {
      href: "/checkout",
      label: "Checkout",
      icon: ShoppingCart,
      description: "Complete your purchase",
    },
    {
      href: "/design-studio",
      label: "Design Studio",
      icon: Palette,
      description: "Create custom designs",
    },
    {
      href: "/addresses",
      label: "Addresses",
      icon: MapPin,
      description: "Manage shipping addresses",
    },
    {
      href: "/profile",
      label: "Profile Settings",
      icon: Settings,
      description: "Account preferences",
    },
  ];

  useEffect(() => {
    if (deviceType !== "mobile") {
      setIsSidebarOpen(false);
    }
  }, [deviceType]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (deviceType === "mobile") {
      setIsSidebarOpen(false);
    }
  }, [pathname, deviceType]);

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // User Profile Header
  const UserProfileHeader = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={cn(
        "flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg",
        compact && "p-3"
      )}
    >
      <div
        className={cn(
          "bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center",
          compact ? "h-10 w-10" : "h-12 w-12"
        )}
      >
        <User
          className={cn(
            "text-green-700 dark:text-green-300",
            compact ? "h-5 w-5" : "h-6 w-6"
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-medium text-foreground truncate",
            compact ? "text-sm" : "text-base"
          )}
        >
          {session.user.phone}
        </p>
        {/* <p className={cn(
          "text-muted-foreground",
          compact ? "text-xs" : "text-sm"
        )}>
          ID: {session.user.id}
        </p> */}
      </div>
    </div>
  );

  // Sidebar Content
  const SidebarContent = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className={cn("flex flex-col h-full", inSheet ? "pt-6" : "p-6")}>
      {inSheet && <UserProfileHeader />}

      <nav className={cn("flex-1", inSheet ? "mt-6" : "mt-0")}>
        <div className="space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => inSheet && setIsSidebarOpen(false)}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0 transition-transform group-hover:scale-110",
                    active ? "h-5 w-5" : "h-5 w-5"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-medium truncate",
                      active ? "text-green-700 dark:text-green-300" : ""
                    )}
                  >
                    {link.label}
                  </div>
                  {!inSheet && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {link.description}
                    </div>
                  )}
                </div>
                {active && (
                  <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );

  // Desktop Sidebar
  // const DesktopSidebar = () => (
  //   <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:border-r lg:border-border lg:bg-muted/10">
  //     <div className="p-6 border-b border-border">
  //       <UserProfileHeader />
  //     </div>
  //     <SidebarContent />
  //   </aside>
  // );

  // Mobile Header with Sidebar Toggle
  const MobileHeader = () => (
    <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
      <div className="flex items-center space-x-3">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="p-2"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-6 pb-0">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent inSheet />
          </SheetContent>
        </Sheet>

        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-green-700 dark:text-green-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Account
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Tablet Header (similar to mobile but more compact)
  const TabletHeader = () => (
    <div className="hidden md:lg:hidden md:flex items-center justify-between p-4 border-b border-border bg-background">
      <UserProfileHeader compact />
    </div>
  );

  return (
    <div className="flex-1 flex">
      {/* Desktop Sidebar */}
      {/* {deviceType === "desktop" && <DesktopSidebar />} */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile/Tablet Headers */}
        {deviceType === "mobile" && <MobileHeader />}
        {deviceType === "tablet" && <TabletHeader />}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div
            className={cn(
              "container mx-auto",
              deviceType === "mobile" ? "px-4 py-6" : "px-6 py-8"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
