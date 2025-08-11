/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, X, Bell, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useCartItemCount } from "@/hooks/use-cart";
import { useUserProfile } from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import AccountDropdown from "@/components/layouts/dashboard/account-dropdown";
import { CartSheet } from "@/components/cart/cart-sheet-dialog";

interface NavbarProps {
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

// Custom hook for handling outside clicks
const useOutsideClick = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);

  return ref;
};

export function CustomerNavbar({ className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const deviceType = useDeviceType();
  const itemCount = useCartItemCount();
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error,
  } = useUserProfile();

  const isAuthenticated = !isProfileLoading && !!userProfile?.email;

  // Close mobile menu when device type changes
  useEffect(() => {
    if (deviceType !== "mobile") {
      setIsMenuOpen(false);
    }
  }, [deviceType]);

  // Handle menu close on outside click for mobile
  const mobileMenuRef = useOutsideClick(() => {
    if (deviceType === "mobile" && isMenuOpen) {
      setIsMenuOpen(false);
    }
  });

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen && deviceType === "mobile") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, deviceType]);

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
    { href: "/design-studio/saved-designs", label: "Saved Designs" },
    { href: "/addresses", label: "Addresses" },
    { href: "/dashboard/customer/profile", label: "Profile Settings" },
  ];

  // Loading state
  if (isProfileLoading) {
    return (
      <nav
        className={cn(
          "sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border",
          className
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Red Bead
              </span>
            </Link>
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

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

  // Search Component
  const SearchComponent = () => (
    <div
      className={cn(
        "relative",
        deviceType === "desktop"
          ? "w-96"
          : deviceType === "tablet"
            ? "w-64"
            : "w-full"
      )}
    >
      {deviceType === "mobile" && !isSearchOpen ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className={cn(
              "w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
              deviceType === "mobile" && "pr-10"
            )}
          />
          {deviceType === "mobile" && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
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

      {/* Search Bar */}
      <div className="hidden md:block flex-1 max-w-md mx-8">
        <SearchComponent />
      </div>

      {/* Right Side Actions */}
      <div className="hidden md:flex items-center space-x-4">
        <CartSheet />

        {isAuthenticated && (
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        )}

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
        {!isSearchOpen && <SearchComponent />}
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
    <>
      {/* Mobile Header Actions */}
      <div className="md:hidden flex items-center space-x-2">
        {!isSearchOpen && !isMenuOpen && (
          <>
            <SearchComponent />
            <CartSheet />
          </>
        )}

        <button
          className="p-2 text-foreground hover:text-muted-foreground transition-colors"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            setIsSearchOpen(false);
          }}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 z-40">
          <SearchComponent />
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-sm z-40 overflow-y-auto">
          <div ref={mobileMenuRef} className="container mx-auto px-4 py-6">
            {isAuthenticated && (
              <div className="flex items-center space-x-3 p-4 mb-6 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    {userProfile?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {userProfile?.name || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.email}
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
        </div>
      )}
    </>
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
