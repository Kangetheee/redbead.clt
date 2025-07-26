/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ReactNode } from "react";
import Link from "next/link";

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  BarChart2,
  Menu,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getSession } from "../../../lib/session/session";
import AccountDropdown from "./profile/account-dropdown";

type Props = Readonly<{ children: ReactNode }>;

export default async function AdminLayout({ children }: Props) {
  const session = await getSession();

  const user = session?.user;

  const navItems = [
    { href: "/dashboard/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/admin/products", label: "Products", icon: Package },
    { href: "/dashboard/admin/customers", label: "Customers", icon: Users },
    {
      href: "/dashboard/admin/customizations",
      label: "Customizations",
      icon: BarChart2,
    },
    {
      href: "/dashboard/admin/communication",
      label: "Communication",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="py-4 border-b">
                    <Link href="/dashboard/admin" className="text-xl font-bold">
                      RedBead Admin
                    </Link>
                  </div>
                  <nav className="flex-1 py-4">
                    <ul className="space-y-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
                            >
                              <Icon className="h-5 w-5" />
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard/admin" className="text-xl font-bold">
              RedBead Admin
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <AccountDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/20">{children}</main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} RedBead Admin. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
