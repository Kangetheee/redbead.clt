/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, X, Bell } from "lucide-react";
import Link from "next/link";
import { useCart, useCartItemCount } from "@/hooks/use-cart";
import { useUserProfile } from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import AccountDropdown from "@/components/layouts/dashboard/account-dropdown";

interface NavbarProps {
  className?: string;
}

export function CustomerNavbar({ className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: cart } = useCart();
  const itemCount = useCartItemCount();
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error,
  } = useUserProfile();

  const isAuthenticated = !isProfileLoading && !!userProfile?.email;

  // Loading state
  if (isProfileLoading) {
    return (
      <nav
        className={cn(
          "sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200",
          className
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Red Bead</span>
            </Link>

            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated Navigation Component
  const AuthenticatedNavigation = () => (
    <>
      {/* Desktop Authenticated Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Cart */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Link>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Account Dropdown */}
        <AccountDropdown />
      </div>

      {/* Mobile Authenticated Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 border-t border-gray-200">
          <div className="flex flex-col space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-2 py-2 bg-green-50 rounded-lg">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-medium text-sm">
                  {userProfile?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {userProfile?.name || "User"}
                </p>
                <p className="text-sm text-gray-600">{userProfile?.email}</p>
              </div>
            </div>

            {/* Main Navigation Links */}
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/design-studio"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Design Studio
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              {/* Cart */}
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
              </Button>

              {/* Account Links */}
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              </Button>

              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/orders" onClick={() => setIsMenuOpen(false)}>
                  My Orders
                </Link>
              </Button>

              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link
                  href="/design-studio/saved-designs"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Saved Designs
                </Link>
              </Button>

              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/addresses" onClick={() => setIsMenuOpen(false)}>
                  Addresses
                </Link>
              </Button>

              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link
                  href="/dashboard/customer/profile"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Unauthenticated Navigation Component
  const UnauthenticatedNavigation = () => (
    <>
      {/* Desktop Unauthenticated Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Link>
        </Button>

        <Button variant="ghost" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>

        <Button className="bg-green-600 hover:bg-green-700" asChild>
          <Link href="/sign-up">Get Started</Link>
        </Button>
      </div>

      {/* Mobile Unauthenticated Navigation */}
      {isMenuOpen && (
        <div className="md:hidden py-4 border-t border-gray-200">
          <div className="flex flex-col space-y-4">
            {/* Main Navigation Links */}
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/design-studio"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Design Studio
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-green-600 transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
              </Button>

              <Button variant="ghost" className="w-full justify-start" asChild>
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
          </div>
        </div>
      )}
    </>
  );

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Red Bead</span>
          </Link>

          {/* Desktop Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/design-studio"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Design Studio
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Dynamic Right Side Navigation based on authentication */}
          {isAuthenticated ? (
            <AuthenticatedNavigation />
          ) : (
            <UnauthenticatedNavigation />
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
