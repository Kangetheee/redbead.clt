"use client";

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
import { FeaturedProductsSection } from "@/components/products/featured-products";

export default function CartPage() {
  const { data: cart, isLoading, error } = useCart();

  const handleEditItem = (item: CartItemResponse) => {
    console.log("Edit item:", item);
  };

  const isEmpty = !cart || !cart.items || cart.items.length === 0;
  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                Shopping Cart
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground">
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
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600 dark:text-green-400" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">
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
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet.
              Start shopping to find amazing custom print solutions!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
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
        {!isLoading && !error && hasItems && cart && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Cart Items
                </h2>
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
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
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CartSummary summary={cart} showDetails={true} />
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="border-border shadow-sm">
                  <CardContent className="p-6">
                    <CartActions cart={cart} />
                  </CardContent>
                </Card>

                {/* Trust Indicators */}
                <Card className="border-border shadow-sm bg-muted/50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-medium text-foreground mb-4">
                      Why shop with us?
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            Quality Guarantee
                          </p>
                          <p className="text-xs text-muted-foreground">
                            100% satisfaction or money back
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            Fast Delivery
                          </p>
                          <p className="text-xs text-muted-foreground">
                            48-hour delivery across Kenya
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            Expert Support
                          </p>
                          <p className="text-xs text-muted-foreground">
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
      {!isLoading && !error && hasItems && (
        <section className="mt-16 bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                You might also like
              </h2>
              <p className="text-muted-foreground">
                Complete your order with these popular items
              </p>
            </div>
            <FeaturedProductsSection limit={4} className="max-w-7xl mx-auto" />
          </div>
        </section>
      )}
    </div>
  );
}
