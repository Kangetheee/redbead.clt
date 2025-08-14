"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCartItemCount } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import AccountDropdown from "@/components/layouts/dashboard/account-dropdown";
import { CartSheet } from "@/components/cart/cart-sheet-dialog";
import { Session } from "@/lib/session/session.types";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

interface CustomerNavbarClientProps {
  session: Session | null;
  className?: string;
}

// Custom hook for device detection
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

export function CustomerNavbarClient({
  session,
  className,
}: CustomerNavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const deviceType = useDeviceType();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const itemCount = useCartItemCount();

  const isAuthenticated = !!session?.user;
  const userProfile = session?.user;

  useEffect(() => {
    if (deviceType !== "mobile") {
      setIsMenuOpen(false);
    }
  }, [deviceType]);

  // Navigation links data
  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/design-studio", label: "Design Studio" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const accountLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/orders", label: "My Orders" },
    { href: "/design-studio", label: "Designs Studio" },
    { href: "/addresses", label: "Addresses" },
    { href: "/dashboard/customer/profile", label: "Profile Settings" },
  ];

  // Logo Component
  const Logo = () => (
    <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
      <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">RB</span>
      </div>
      <span
        className={cn(
          "font-bold text-foreground",
          deviceType === "mobile" ? "text-lg" : "text-xl"
        )}
      >
        Red Bead
      </span>
    </Link>
  );

  // Desktop Navigation
  const DesktopNavigation = () => (
    <>
      {/* Main Navigation Links */}
      <div className="hidden lg:flex items-center space-x-8">
        {navigationLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right Side Actions */}
      <div className="hidden md:flex items-center space-x-4">
        <CartSheet />

        {/* {isAuthenticated && (
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        )} */}

        {isAuthenticated ? (
          <AccountDropdown />
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              asChild
            >
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );

  // Tablet Navigation
  const TabletNavigation = () => (
    <>
      {/* Condensed Navigation */}
      <div className="hidden md:lg:hidden md:flex items-center space-x-6">
        {navigationLinks.slice(0, 3).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <Button variant="ghost" size="sm">
          More <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Right Side Actions */}
      <div className="md:lg:hidden md:flex items-center space-x-3">
        <CartSheet />

        {isAuthenticated ? (
          <AccountDropdown />
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              asChild
            >
              <Link href="/sign-up">Start</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );

  // Mobile Navigation
  const MobileNavigation = () => (
    <div className="md:hidden flex items-center space-x-2">
      <CartSheet />

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 text-foreground hover:text-muted-foreground"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            {isAuthenticated && userProfile && (
              <div className="flex items-center space-x-3 p-4 mb-6 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    {userProfile.id?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  {/* <p className="font-medium text-foreground">
                    User ID: {userProfile.id}
                  </p> */}
                  <p className="text-sm text-muted-foreground">
                    {userProfile.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <div className="space-y-1 mb-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Account Section */}
            {isAuthenticated && (
              <div className="border-t border-border pt-6 space-y-1">
                <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Account
                </h3>
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 text-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Auth Actions */}
            {!isAuthenticated && (
              <div className="border-t border-border pt-6 space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  asChild
                >
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  asChild
                >
                  <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "flex items-center justify-between",
            deviceType === "mobile" ? "h-14" : "h-16"
          )}
        >
          <Logo />

          {/* Device-specific navigation rendering */}
          {deviceType === "desktop" && <DesktopNavigation />}
          {deviceType === "tablet" && <TabletNavigation />}
          {deviceType === "mobile" && <MobileNavigation />}
        </div>
      </div>
    </nav>
  );
}
