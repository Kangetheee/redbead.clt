"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ShoppingCart,
  ShoppingBag,
  ArrowLeft,
  Menu,
  X,
  Heart,
  Shield,
  Truck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/components/cart/cart-item";
import CartSummary from "@/components/cart/cart-summary";
import { CartActions } from "@/components/cart/cart-actions";
import { CartItemResponse } from "@/lib/cart/types/cart.types";

export default function CartPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: cart, isLoading, error } = useCart();

  const handleEditItem = (item: CartItemResponse) => {
    // Navigate to product customization page or open edit modal
    console.log("Edit item:", item);
    // You can implement navigation to edit the item here
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Red Bead</span>
            </Link>

            {/* Desktop Navigation */}
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

            {/* Desktop Auth & Cart */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </Link>
              </Button>

              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>

              <Button className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
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
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                      <ShoppingCart className="h-4 w-4 mr-2 text-green-600" />
                      Cart
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 font-medium">
                Shopping Cart
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-600">
                {isLoading
                  ? "Loading..."
                  : isEmpty
                    ? "Your cart is empty"
                    : `${cart.summary.itemCount} item${cart.summary.itemCount !== 1 ? "s" : ""} in your cart`}
              </p>
            </div>
          </div>

          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">
                Failed to load cart. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty Cart State */}
        {!isLoading && !error && isEmpty && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet.
              Start shopping to find amazing custom print solutions!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                asChild
              >
                <Link href="/products">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Browse Products
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/design-studio">
                  <Heart className="h-5 w-5 mr-2" />
                  Custom Design
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Cart Content */}
        {!isLoading && !error && !isEmpty && cart && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items
                </h2>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {cart.summary.totalQuantity} items
                </Badge>
              </div>

              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} onEdit={handleEditItem} />
              ))}
            </div>

            {/* Cart Summary & Actions */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Order Summary */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CartSummary summary={cart.summary} showDetails={true} />
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <CartActions cart={cart} />
                  </CardContent>
                </Card>

                {/* Trust Indicators */}
                <Card className="border-gray-200 shadow-sm bg-gray-50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Why shop with us?
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            Quality Guarantee
                          </p>
                          <p className="text-xs text-gray-600">
                            100% satisfaction or money back
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Truck className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            Fast Delivery
                          </p>
                          <p className="text-xs text-gray-600">
                            48-hour delivery across Kenya
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Heart className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            Expert Support
                          </p>
                          <p className="text-xs text-gray-600">
                            24/7 customer service available
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recently Viewed / Recommendations Section */}
      {!isLoading && !error && !isEmpty && (
        <section className="mt-16 bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You might also like
              </h2>
              <p className="text-gray-600">
                Complete your order with these popular items
              </p>
            </div>

            {/* This would contain recommended products */}
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                    <h3 className="font-medium text-sm mb-1">
                      Custom Lanyard #{i}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Premium quality material
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-600">
                        KES {(250 + i * 50).toLocaleString()}
                      </span>
                      <Button size="sm" variant="outline">
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
